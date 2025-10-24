# Firebase Studio

Ceci est un projet de démarrage Next.js dans Firebase Studio.

Pour commencer, jetez un œil à `src/app/page.tsx`.

## Lancer l'application localement

Après avoir téléchargé le code, vous aurez besoin de Node.js (version 20 ou supérieure) installé sur votre ordinateur.

1.  **Installer les dépendances :**
    Ouvrez un terminal dans le dossier du projet et exécutez :
    ```bash
    npm install
    ```

2.  **Configurer la clé API (pour l'IA, via Groq – gratuit) :**
    -   Créez un compte sur `https://console.groq.com/` et générez une clé API (offre gratuite, sans carte bancaire).
    -   Créez un fichier nommé `.env` à la racine de votre projet.
    -   Ajoutez cette ligne dans le fichier `.env`, en remplaçant `VOTRE_CLÉ_API_ICI` par votre clé :
        ```
        GROQ_API_KEY=VOTRE_CLÉ_API_ICI
        ```

3.  **Lancer l'application :**
    -   Les intégrations IA n'utilisent plus Genkit/Gemini en local. Lancez simplement :
        ```bash
        npm run dev
        ```

L'application sera alors disponible à l'adresse `http://localhost:3000`.

### Accéder à l'application depuis votre téléphone (en local)

Pour tester l'application sur votre téléphone pendant qu'elle tourne sur votre ordinateur :

1.  **Connectez-vous au même Wi-Fi :** Assurez-vous que votre ordinateur et votre téléphone sont sur le même réseau Wi-Fi.
2.  **Trouvez l'adresse IP locale de votre ordinateur :**
    -   **Sur Mac :** Allez dans `Préférences Système` > `Réseau` > `Wi-Fi`. Votre adresse IP sera affichée (ex: `192.168.1.10`).
    -   **Sur Windows :** Ouvrez l'invite de commandes (`cmd`) et tapez `ipconfig`. Cherchez l'adresse "IPv4".
3.  **Ouvrez le lien sur votre téléphone :**
    Sur le navigateur de votre téléphone, entrez l'adresse suivante en remplaçant `ADRESSE_IP_DE_VOTRE_PC` par l'adresse que vous venez de trouver :
    ```
    http://ADRESSE_IP_DE_VOTRE_PC:3000
    ```
Si cela ne fonctionne pas, il se peut que le pare-feu de votre ordinateur bloque la connexion. Vous devrez peut-être autoriser Node.js ou votre terminal à accepter les connexions entrantes.

## Sauvegarder et Partager votre Code (avec Git)

Pour enregistrer les modifications que vous avez apportées à votre application, vous pouvez utiliser les commandes Git directement dans le terminal de Firebase Studio. C'est comme créer un point de sauvegarde.

1.  **Préparer tous les fichiers modifiés :**
    Cette commande prépare toutes vos modifications pour la sauvegarde. Le `.` signifie "tous les fichiers dans le dossier actuel".
    ```bash
    git add .
    ```

2.  **Créer un point de sauvegarde (commit) :**
    Cette commande enregistre vos modifications avec un message qui décrit ce que vous avez fait. Remplacez `"votre message"` par une courte description (par ex. `"Ajout de la liste de courses"`).
    ```bash
    git commit -m "votre message"
    ```

3.  **Envoyer vos sauvegardes vers un dépôt distant (comme GitHub) :**
    Si votre projet est lié à un service comme GitHub, cette commande envoie vos modifications vers ce service, les rendant accessibles depuis n'importe où.
    ```bash
    git push
    ```

## Déployer l'application sur internet (Alternative gratuite à Firebase)

Pour rendre votre application accessible depuis n'importe où sans dépendre de votre ordinateur, vous pouvez la déployer gratuitement sur des plateformes comme **Vercel** ou **Netlify**.

**Étapes générales (exemple avec Vercel) :**

1.  **Mettez votre projet sur GitHub :** Si ce n'est pas déjà fait, créez un dépôt sur [GitHub](https://github.com/) et poussez votre code.

2.  **Créez un compte Vercel :**
    -   Allez sur [vercel.com](https://vercel.com) et inscrivez-vous avec votre compte GitHub.

3.  **Importez et déployez votre projet :**
    -   Sur votre tableau de bord Vercel, cliquez sur "Add New..." -> "Project".
    -   Importez votre projet depuis GitHub.
    -   Vercel détectera automatiquement que c'est un projet Next.js.
    -   Avant de déployer, allez dans la section "Environment Variables" (Variables d'environnement).
    -   Ajoutez votre clé API avec le nom `GROQ_API_KEY` et la valeur générée dans la console Groq.
    -   Cliquez sur **"Deploy"**.

Après quelques instants, Vercel vous fournira une URL publique pour votre application (par exemple : `mon-assistant.vercel.app`), accessible depuis n'importe quel appareil connecté à internet.
