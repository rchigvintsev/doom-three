class Entity
  def initialize(entity_body)
  end

  def parse_origin(entity_body)
    if match = entity_body.match(/"origin"\s+"([0-9 -]+)"/)
      origin = match.captures[0].split
      return [origin[1].to_f, origin[2].to_f, origin[0].to_f]
    else
      STDERR.puts 'Entity does not contain origin coordinates'
    end
  end
end

class WorldSpawn < Entity
  def to_json
    ''
  end
end

class InfoPlayerStart < Entity
  def initialize(entity_body)
    @origin = parse_origin(entity_body)
  end

  def to_json
    "\"playerPosition\":[#{@origin[0]},#{@origin[1]},#{@origin[2]}]"
  end
end

class Light < Entity
  def initialize(entity_body)
    @type = 'point'
    @origin = parse_origin(entity_body)

    if match = entity_body.match(/"_color"\s+"([0-9 .]+)"/)
      color = match.captures[0].split
      @color = '#'
      color.each do |rgb|
        s = (rgb.to_f * 255).round.to_s(16)
        if s.length < 2
          s = '0' + s;
        end
        @color += s
      end
    else
      STDERR.puts '"light" entity does not contain light color'
    end

    @intencity = 1
    @distance = 272
  end

  def to_json
    "{" +
      "\"type\":\"#{@type}\"," +
      "\"position\":[#{@origin[0]},#{@origin[1]},#{@origin[2]}]," +
      "\"color\":\"#{@color}\"," +
      "\"intencity\":#{@intencity}," +
      "\"distance\":#{@distance}" +
    "}"
  end
end

class Func < Entity
  def initialize(entity_class, entity_body)
    @entity_class = entity_class
    if match = entity_body.match(/"name"\s+"(\w+)"/)
      @name = match.captures[0]
    end
    @origin = parse_origin(entity_body)
    if match = entity_body.match(/^\s*"model"\s+"([A-Za-z0-9\/_]+)"\s*$/)
      @model_name = match.captures[0]
    else
      STDERR.puts "Failed to parse model name of 'func_static'/'func_mover' entity"
    end
    if match = entity_body.match(/"bind"\s+"(\w+)"/)
      @bind = match.captures[0]
    end
  end

  def entity_class
    @entity_class
  end

  def name
    @name
  end

  def origin
    @origin
  end

  def model_name
    @model_name
  end
end

class MoveableBase < Entity
  def initialize(entity_class, entity_body)
    @entity_class = entity_class
    if match = entity_body.match(/"name"\s+"(\w+)"/)
      @name = match.captures[0]
    end
    @origin = parse_origin(entity_body)
    if match = entity_body.match(/^\s*"model"\s+"([A-Za-z0-9\/_]+)"\s*$/)
      @model_name = match.captures[0]
    else
      STDERR.puts "Failed to parse model name of 'moveable_base' entity"
    end
  end

  def entity_class
    @entity_class
  end

  def name
    @name
  end

  def origin
    @origin
  end

  def model_name
    @model_name
  end
end

class LWOModel < Func
  def initialize(entity_class, entity_body)
    super(entity_class, entity_body)
    if @name === 'func_static_4911' # It's a candle that should stand on the floor without any animation
      @origin[1] -= 17.5
      @bind = nil
    end
    if match = entity_body.match(/"model"\s+"([\w\/()]+)\.lwo"/)
      @url = "#{match.captures[0]}.json"
    else
      STDERR.puts '"func_static"/"func_mover" entity does not have a model name'
    end
  end

  def to_json
    s = "{" +
      "\"type\":\"lwo\"," +
      "\"name\":\"#{@name}\"," +
      "\"url\":\"#{@url}\"," +
      "\"position\":[#{@origin[0]},#{@origin[1]},#{@origin[2]}]"

    if @bind
      s += ",\"animation\":\"#{@bind}\""
    end

    s + "}"
  end
end

class ASEModel < Func
  def initialize(entity_class, entity_body)
    super(entity_class, entity_body)
    if match = entity_body.match(/"model"\s+"([\w\/()]+)\.(ASE|ase)"/)
      @url = "#{match.captures[0]}.json"
    else
      STDERR.puts '"func_static"/"func_mover" entity does not have a model name'
    end
  end

  def to_json
    "{" +
      "\"type\":\"ase\"," +
      "\"name\":\"#{@name}\"," +
      "\"url\":\"#{@url}\"," +
      "\"position\":[#{@origin[0]},#{@origin[1]},#{@origin[2]}]" +
    "}"
  end
end

class Bobbing
  def initialize(entity_body)
    if match = entity_body.match(/"name"\s+"(\w+)"/)
      @name = match.captures[0]
    end
    if match = entity_body.match(/"height"\s+"(\d+)"/)
      @height = match.captures[0]
    end

    if match = entity_body.match(/"speed"\s+"(\d+)"/)
      @speed = match.captures[0]
    end
  end

  def to_json
    "{" +
      "\"name\":\"#{@name}\"," +
      "\"height\":#{@height}," +
      "\"speed\":#{@speed}" +
    "}"
  end
end

class Model
  def initialize(model_body, skyboxes)
    match = model_body.lines.first
        .match(/\s*model\s*\{\s*\/\*\s*name\s*=\s*\*\/\s*"([\w]+)"\s*\/\*\s*numSurfaces\s*=\s*\*\/\s*(\d+)/)
    if not match
      STDERR.puts "First line of model body (#{model_body.lines.first}) does " +
          "not contain model name and number of surfaces"
      return
    end

    @name = match.captures[0]
    @surfaces_number = match.captures[1].to_i
    @surfaces = []

    if @surfaces_number > 0
      surface_started = false
      surface_body = ''

      skip = false

      model_body.each_line do |line|
        if line.strip.start_with? '/* surface '
          if surface_started
            STDERR.puts "Unclosed surface is detected around the line #{line}"
          else
            surface_started = true
          end
          match = line.match(/\/\*\s*surface\s*\d+\s*\*\/\s*{\s*"([\w\/_]+)"/)
          if match
            material_class = match.captures[0]
            if material_class == 'textures/skies/desert'
              skyboxes << Skybox.new(material_class)
              skip = true
            end
          end
          surface_body = line
        elsif surface_started
          if line.strip == '}'
            surface_started = false
            if !skip
              @surfaces << Surface.new(surface_body)
            else
              skip = false
              @surfaces_number -= 1
            end
          else
            surface_body += line
          end
        end
      end

      if @surfaces_number != @surfaces.length
        STDERR.puts "Number of processed surfaces (#{@surfaces.length}) " +
            "does not equal to declared number of surfaces (#{@surfaces_number}) " +
            "in model #{@name}"
      end
    end

    puts "Model #{@name} is processed"
  end

  def name
    @name
  end

  def surfaces_number
    @surfaces_number
  end

  def mover=(m)
    @mover = m
  end

  def to_json
    json = "{\"type\":\"#{@mover ? @mover.entity_class : 'area'}\","
    json += "\"name\":\"#{@name}\","
    if @mover
      json += "\"position\":[#{@mover.origin[0]},#{@mover.origin[1]},#{@mover.origin[2]}],"
    end
    json += "\"surfaces\":["
    @surfaces.each_index do |idx|
      if idx > 0
        json += ','
      end
      json += @surfaces[idx].to_json
    end
    json += "]}"
  end
end

class Surface
  def initialize(surface_body)
    match = surface_body.match(/\/\*\s*(surface\s*\d+)\s*\*\/\s*{\s*"([\w\/_]+)"\s*\/\*\s*numVerts\s*=\s*\*\/\s*(\d+)/)
    if match
      @name = match.captures[0].tr(' ', '')
      @material_name = match.captures[1]
      @vertices_number = match.captures[2].to_i

      @vertices = []
      opened_parentheses = []
      vertex = ''
      i = 0
      while @vertices.length < @vertices_number and i < surface_body.length
        if surface_body[i] == '('
          opened_parentheses.push '('
          vertex = ''
        elsif surface_body[i] == ')'
          if opened_parentheses.empty?
            STDERR.puts 'Unpaired closing parenthesis'
          else
            opened_parentheses.pop
            if opened_parentheses.empty?
              if vertex.empty?
                STDERR.puts 'Empty vertex'
              else
                vertex = vertex.strip.split
                @vertices << [vertex[1].to_f, vertex[2].to_f, vertex[0].to_f, vertex[3].to_f, vertex[4].to_f]
              end
            end
          end
        elsif not opened_parentheses.empty?
          vertex += surface_body[i]
        end
        i += 1
      end

      if @vertices.length < @vertices_number
        STDERR.puts "Declared vertices number: #{@vertices_number}. " +
            "Actual vertices number: #{@vertices.length}."
      end

      if i < surface_body.length
        @faces = []
        face = []

        faces = surface_body[i, surface_body.length].strip.split
        faces.each_index do |idx|
          face << faces[idx].to_i
          if (idx + 1) % 3 == 0
            @faces << face
            face = []
          end
        end
      else
        STDERR.puts "Surface does not contain information about faces"
      end
    else
      STDERR.puts 'Surface does not contain header'
    end
  end

  def to_json
    json = "{\"name\":\"#{@name}\",\"geometry\":{\"vertices\":["
    @vertices.each_index do |idx|
      if idx > 0
        json += ','
      end
      json += "[#{@vertices[idx][0]},#{@vertices[idx][1]},#{@vertices[idx][2]}]"
    end
    json += "],\"faces\":["
    @faces.each_index do |idx|
      if idx > 0
        json += ','
      end
      json += "[#{@faces[idx][0]},#{@faces[idx][1]},#{@faces[idx][2]}]"
    end
    json += "],\"uvs\":["
    @faces.each_index do |faceIdx|
      if faceIdx > 0
        json += ','
      end

      json += '['

      face = @faces[faceIdx]

      json += "[#{@vertices[face[0]][3]},#{@vertices[face[0]][4]}],"
      json += "[#{@vertices[face[1]][3]},#{@vertices[face[1]][4]}],"
      json += "[#{@vertices[face[2]][3]},#{@vertices[face[2]][4]}]"

      json += ']'
    end
    json += "]},\"material\":\"#{@material_name}\"}"
  end
end

class Skybox
  def initialize(skybox_class)
    @skybox_class = skybox_class
    if skybox_class == 'textures/skies/desert'
      @textures = [
        'env/desert_right',
        'env/desert_left',
        'env/desert_up',
        'env/desert_down',
        'env/desert_forward',
        'env/desert_back'
      ];
    else
      raise "Unknown skybox class: #{skybox_class}"
    end
  end

  def skybox_class
    @skybox_class
  end

  def to_json
    "{\"textures\":#{@textures},\"size\":100000}"
  end
end

map_name = ARGV[0]

line_number = 0
entities = []
lights = []
skyboxes = []
models = []
animations = []
movers = {}

File.open("#{map_name}.map", 'r') do |file|
  line_number = 0

  opened_brakets = []

  entity_started = false
  entity_body = ''

  while line = file.gets
    line_number += 1
    stripped = line.strip

    if stripped == '{'
      if entity_started
        opened_brakets.push '{'
      else
        entity_started = true
      end
    elsif stripped == '}'
      if not entity_started
        STDERR.puts "Unpaired curly bracket at line #{line_number}"
      elsif opened_brakets.length == 0
        entity_started = false
        if match = entity_body.match(/"classname"\s+"(\w+)"/)
          entity_class = match.captures[0]

          if entity_class == 'worldspawn'
            entities << WorldSpawn.new(entity_body)
          elsif entity_class == 'info_player_start'
            entities << InfoPlayerStart.new(entity_body)
          elsif entity_class == 'light'
            lights << Light.new(entity_body)
          elsif entity_class == 'func_static' || entity_class == 'func_mover'
            if model_match = entity_body.match(/^\s*"model"\s+"[A-Za-z0-9\/_()]+\.(lwo|ASE|ase)"\s*$/)
              if model_match.captures[0] == 'lwo'
                models << LWOModel.new(entity_class, entity_body)
              else
                models << ASEModel.new(entity_class, entity_body)
              end
            elsif entity_body.include? '"origin"' and entity_body.include? '"model"'
              new_func = Func.new(entity_class, entity_body)
              if new_func.model_name
                movers[new_func.model_name] = new_func
              end
            else
              STDERR.puts "Unrecognized 'func_static'/'func_mover' entity closed at line #{line_number}"
            end
          elsif entity_class == 'moveable_base'
            new_moveable = MoveableBase.new(entity_class, entity_body)
            if new_moveable.model_name
              movers[new_moveable.model_name] = new_moveable
            end
          elsif entity_class == 'func_bobbing' # Animation
            animations << Bobbing.new(entity_body)
          else
            STDERR.puts "Unknown entity (#{entity_class}) closed at line #{line_number}"
          end
        else
          STDERR.puts "Entity without classname closed at line #{line_number}"
        end
        entity_body = ''
      else
        opened_brakets.pop
      end
    end

    if entity_started
      entity_body += line
    end
  end
end

line_number = 0

File.open("#{map_name}.proc", 'r') do |file|
  model_started = false
  model_body = ''

  opened_brakets = []

  while line = file.gets
    line_number += 1

    if line.strip.start_with? 'model'
      if model_started
        STDERR.puts "Unclosed model is detected around the line #{line_number}"
      else
        model_started = true
        opened_brakets.push '{'
      end
      model_body = line
    elsif model_started
      if line.strip == '}'
        opened_brakets.pop
        if opened_brakets.empty?
          model_started = false
          new_model = Model.new(model_body, skyboxes)
          new_model.mover = movers[new_model.name]
          models << new_model
        end
      else
        if line.strip.include? '{'
          opened_brakets.push '{'
        end
      end
      model_body += line
    end
  end
end

puts "#{models.length} #{models.length == 1 ? 'model' : 'models'} processed"

def array_to_json(a)
  map = ''
  a.each_index do |idx|
    e = a[idx]

    next if e.kind_of? Model and e.surfaces_number == 0

    json = e.to_json
    if not json.empty?
      if not map.empty?
        map += ','
      end
      map += json
    end
  end
  map
end

map = "{\"name\":\"#{map_name}\",#{array_to_json(entities)}," +
      "\"models\":[#{array_to_json(models)}]," +
      "\"lights\":[#{array_to_json(lights)}]," +
      "\"animations\":[#{array_to_json(animations)}]"

if skyboxes.length > 0
  if skyboxes.length > 1
    i = 0
    while i < skyboxes.length - 1
      if skyboxes[i].skybox_class != skyboxes[i + 1].skybox_class
        STDERR.puts "Different skyboxes have found (#{skyboxes[i].skybox_class} and #{skyboxes[i + 1].skybox_class})"
        break
      end
      i += 1
    end
  end
  map += ",\"skybox\":#{skyboxes[0].to_json}"
end

map += "}"

File.open("#{map_name}.json", 'w') { |f| f.write(map) }

puts "Map #{map_name} is successfully converted"
