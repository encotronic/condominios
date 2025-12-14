PR creation instructions (PowerShell)

1) Crea una rama desde tu rama base (ej. `develop` o `main`):

```powershell
cd "C:\Users\Netelcom\Documents\App movil\condominios"
git checkout -b feat/multi-condo-tests
```

2) Añade los cambios y commitea:

```powershell
git add .
git commit -m "feat: multi-condo helper + validate override + tests + CI"
```

3) Push a remote y abre PR (GitHub):

```powershell
git push -u origin feat/multi-condo-tests
# Luego ir a GitHub y abrir PR desde esa rama hacia develop/main
```

Notas:
- Revisa `backend/PR_BODY.md` como base para la descripción del PR.
- Si usas pipelines que requieren DB, habilita/ajusta el servicio PostgreSQL en CI y elimina `SKIP_DB_INIT`.
