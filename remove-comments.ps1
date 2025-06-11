# Script PowerShell pour supprimer les commentaires Creative Tim
Write-Host "Suppression des commentaires Creative Tim en cours..." -ForegroundColor Cyan

$sourceDir = ".\SUIV\suiv\src"
$pattern = "\/\*[\s\S]*?Product Page[\s\S]*?Creative Tim[\s\S]*?\*\/"

# Récupérer tous les fichiers JS et JSX
$files = Get-ChildItem -Path $sourceDir -Recurse -Include "*.js","*.jsx" 

$count = 0
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    # Vérifier si le fichier contient le pattern
    if ($content -match $pattern) {
        # Remplacer le pattern par une chaîne vide
        $newContent = $content -replace $pattern, ""
        # Écrire le nouveau contenu dans le fichier
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $count++
        Write-Host "Mis à jour: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "Terminé! $count fichiers ont été mis à jour." -ForegroundColor Cyan 