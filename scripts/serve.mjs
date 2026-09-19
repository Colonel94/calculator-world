import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
http.createServer(async(req,res)=>{try{const request=new URL(req.url,'http://localhost');if(!request.pathname.startsWith('/calculator-world/')){res.writeHead(302,{location:'/calculator-world/'});res.end();return;}const relative=decodeURIComponent(request.pathname.slice('/calculator-world/'.length))||'index.html';const target=path.resolve(root,relative);if(!target.startsWith(root)||target.includes(`${path.sep}.git`))throw Error();if(!(await stat(target)).isFile())throw Error();res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(target));}catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173/calculator-world/'));
