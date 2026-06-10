# PowerShell script to clean git history
$commits = @('187a41b', 'd57d848', 'a87d587', '430c29b')
$pattern = 'sk-proj-[A-Za-z0-9_-]+'

foreach ($commit in $commits) {
    Write-Host "Checking commit: $commit"
    git show $commit:backend/.env | Select-String $pattern
}
