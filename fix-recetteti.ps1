$file = 'src\components\RecipesView.tsx'
$lines = [System.IO.File]::ReadAllLines($file)

# Line 617 (1-indexed) = index 616
# Old: <Image src={recipe.photoDataUri} alt={recipe.title} layout="fill" objectFit="cover" className="rounded-lg" />
# New: <img src={recipe.photoDataUri} alt={recipe.title} className="w-full h-full object-cover" />
$lines[616] = '                            <img src={recipe.photoDataUri} alt={recipe.title} className="w-full h-full object-cover" />'

[System.IO.File]::WriteAllLines($file, $lines)
Write-Host "Done - switched to native img tag"

