import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const clientRoot = path.join(__dirname, '../client');

app.get('/', (req: Request, res: Response) => {
    res.sendFile('index.html', {root: clientRoot});
});

app.use(express.static(clientRoot));

app.listen(port, () => {
    console.debug(`[server]: Server is running at http://localhost:${port}`);
});
