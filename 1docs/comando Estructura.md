------------  Frontend  -------------
dir /s /b | findstr /v "node_modules" | findstr /v "\.next" | findstr "\.ts$ \.js$ \.tsx$ \.jsx$" > frontend_files.txt && notepad frontend_files.txt

------------  Backend   -------------

cd ..\backend && dir /s /b | findstr /v "node_modules" | findstr "\.js$" > backend_routes.txt && notepad backend_routes.txt