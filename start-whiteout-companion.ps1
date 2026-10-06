$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  $nodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
  if (Test-Path -LiteralPath $nodePath) { $node = [pscustomobject]@{ Source = $nodePath } }
}
if (-not $node) { throw 'Node.js est requis pour lancer le serveur local.' }
$root = $PSScriptRoot.Replace('\','\\')
$script = "const http=require('http'),fs=require('fs'),path=require('path'),root='$root',types={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'text/javascript;charset=utf-8','.png':'image/png','.jpeg':'image/jpeg'};http.createServer((q,s)=>{let p=path.join(root,q.url==='/'?'index.html':decodeURIComponent(q.url));if(!p.startsWith(root)||!fs.existsSync(p)){s.statusCode=404;return s.end()}s.setHeader('Content-Type',types[path.extname(p)]||'application/octet-stream');s.setHeader('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');fs.createReadStream(p).pipe(s)}).listen(4173,'127.0.0.1',()=>console.log('Whiteout Companion : http://127.0.0.1:4173'))"
Start-Process -FilePath $node.Source -ArgumentList @('-e', $script) -WindowStyle Hidden
Start-Sleep -Milliseconds 700
Start-Process 'http://127.0.0.1:4173'
