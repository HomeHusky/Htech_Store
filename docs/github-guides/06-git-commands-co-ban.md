# Các lệnh Git cơ bản cần biết

Tài liệu này gom các lệnh Git thường dùng nhất cho workflow hằng ngày.

## 1. Khởi tạo và kết nối repo

```powershell
git init
git clone <repo-url>
git remote -v
git remote add origin <repo-url>
git remote set-url origin <repo-url>
git remote remove origin
```

## 2. Kiểm tra trạng thái và lịch sử

```powershell
git status
git log --oneline --graph --decorate --all
git show <commit>
git diff
git diff --staged
```

## 3. Stage và commit

```powershell
git add .
git add <file>
git restore --staged <file>
git commit -m "message"
git commit --amend -m "new message"
```

## 4. Branch cơ bản

```powershell
git branch
git branch -a
git checkout -b <new-branch>
git switch -c <new-branch>
git switch <branch>
git branch -d <branch>
```

## 5. Push/Pull/Fetch

```powershell
git fetch
git pull
git pull --rebase
git push
git push -u origin <branch>
```

## 6. Đồng bộ thay đổi và xử lý xung đột

```powershell
git merge <branch>
git rebase <branch>
git rebase --continue
git merge --abort
git rebase --abort
```

## 7. Undo cơ bản

```powershell
git restore <file>
git checkout -- <file>
git reset HEAD <file>
git revert <commit>
```

Lưu ý:
- Ưu tiên git revert khi muốn đảo commit đã push để an toàn lịch sử.

### 7.1. Lỡ commit sai tên thì xử lý thế nào

Trường hợp 1: Sai tên commit message (chưa push)

```powershell
git commit --amend -m "message đúng"
```

Trường hợp 2: Sai tên/email người commit ở commit gần nhất (chưa push)

```powershell
git config user.name "Tên đúng"
git config user.email "email-dung@example.com"
git commit --amend --reset-author --no-edit
```

Trường hợp 3: Muốn bỏ hẳn commit gần nhất (chưa push)

```powershell
# Bỏ commit nhưng giữ code trong vùng stage
git reset --soft HEAD~1

# Bỏ commit và bỏ stage, giữ code trong working tree
git reset --mixed HEAD~1

# Bỏ commit và xóa luôn thay đổi của commit đó khỏi local
git reset --hard HEAD~1
```

Ghi chú:
- Đây là cách xóa commit ở local mà không chuyển nhánh.
- `--soft` giữ thay đổi trong stage, `--mixed` giữ trong working tree, `--hard` xóa luôn thay đổi khỏi local.
- Nếu muốn xóa nhiều commit local liên tiếp, thay `HEAD~1` bằng `HEAD~n`.

Trường hợp 3b: Có 2 commit chưa push và muốn xóa cả 2 commit gần nhất

```powershell
git reset --mixed HEAD~2
```

Ghi chú:
- `HEAD~1` chỉ xóa 1 commit gần nhất.
- `HEAD~2` sẽ đưa nhánh lùi 2 commit, xóa cả 2 commit local gần nhất.
- Nếu muốn giữ thay đổi trong stage, dùng `git reset --soft HEAD~2`.
- Nếu muốn xóa luôn thay đổi của cả 2 commit khỏi local, dùng `git reset --hard HEAD~2`.

Trường hợp 4: Commit đã push lên remote

```powershell
# Cách an toàn: tạo commit đảo ngược
git revert <commit>
git push
```

Ghi chú:
- Nếu đã push và vẫn muốn sửa lịch sử (amend/reset rồi push đè), cần dùng `git push --force-with-lease` và thống nhất với team trước.

## 8. Tag và release cơ bản

```powershell
git tag
git tag v1.0.0
git push origin v1.0.0
git push origin --tags
```

## 9. Stash tạm thay đổi

```powershell
git stash
git stash list
git stash pop
git stash apply
```

## 10. Cấu hình Git quan trọng

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config user.name "Your Name"
git config user.email "you@example.com"
git config --list
```

## 11. Workflow nhanh mỗi ngày

```powershell
git status
git add .
git commit -m "feat: update ..."
git pull --rebase
git push
```

## 12. Workflow an toàn trước khi publish

```powershell
git config user.email
git remote -v
git branch
```

Nếu cả 3 thông tin đúng thì mới push.
