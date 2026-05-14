# Backend rieng cho Hugging Face

Root repo `Htech_Store` day len GitHub `origin`.

Thu muc `backend` la Git repo rieng va day truc tiep len Hugging Face Space. Nhu vay khi dang o `backend`, co the dung Git binh thuong:

```powershell
git status
git add .
git commit -m "Update backend"
git push
```

## Remote backend

Trong `backend`, remote `origin` tro den Hugging Face:

```powershell
cd D:\AI\Sale_Agent\Htech_Store\backend
git remote -v
```

Ket qua can co:

```text
origin  git@hf-vitrannhat1:spaces/vitrannhat1/HtechStore (fetch)
origin  git@hf-vitrannhat1:spaces/vitrannhat1/HtechStore (push)
```

## Push backend lan sau

Dung trong `backend`:

```powershell
git status
git add .
git commit -m "Update backend"
git push
```

## Root repo GitHub

Dung o root repo de push frontend/docs/cau hinh khac len GitHub:

```powershell
cd D:\AI\Sale_Agent\Htech_Store
git status
git add .
git commit -m "Update app"
git push origin master
```

Root repo ignore `backend/`, nen backend khong con nam trong commit moi cua GitHub `origin`.

## Kiem tra deploy

```powershell
Invoke-WebRequest -UseBasicParsing https://vitrannhat1-htechstore.hf.space/health
```

Ket qua dung:

```json
{"status":"ok"}
```

## Ghi chu

- `backend/Dockerfile` la Dockerfile cua Hugging Face Space.
- `backend/README.md` co metadata `sdk: docker` va `app_port: 7860`.
- Viec bo backend khoi `origin` chi ap dung cho trang thai Git moi. Backend van co trong lich su commit cu neu chua rewrite history.
