export const Faces = {
    intersection: function (face1, face2) {
        const result = [];
        const vertices = [face1.a, face1.b, face1.c];
        for (let p of ['a', 'b', 'c']) {
            const idx = vertices.indexOf(face2[p]);
            if (idx >= 0)
                result.push(vertices.splice(idx, 1)[0]);
        }
        return result;
    },

    difference: function (face1, face2) {
        const result = [];
        const vertices = [face1.a, face1.b, face1.c];
        for (let p of ['a', 'b', 'c']) {
            const idx = vertices.indexOf(face2[p]);
            if (idx < 0)
                result.push(face2[p]);
        }
        return result;
    }
};
