# Fonctionnalité de chat en temps réel

Cette fonctionnalité permet aux utilisateurs de communiquer instantanément via un système de messagerie en temps réel basé sur Socket.IO. Elle inclut des indicateurs de statut (message envoyé, livré, lu) et des notifications en temps réel.

## Caractéristiques

- Communication instantanée entre utilisateurs
- Indicateurs de statut de message (envoyé, livré, lu)
- Indications de connexion en temps réel
- Interface responsive adaptée aux mobiles et ordinateurs
- Historique des conversations
- Notifications pour les nouveaux messages

## Installation et configuration

### 1. Installation des dépendances

Dans le dossier principal du projet :

```bash
npm install socket.io-client
```

### 2. Configuration du serveur

Dans un nouveau dossier pour le serveur :

```bash
# Copier le fichier package-server.json vers le nouveau dossier
cp package-server.json /chemin/vers/dossier-serveur/package.json
# Copier le fichier server.js
cp server.js /chemin/vers/dossier-serveur/

# Se déplacer dans le dossier serveur
cd /chemin/vers/dossier-serveur

# Installer les dépendances
npm install
```

### 3. Démarrer le serveur

```bash
npm run dev
```

Le serveur écoutera sur le port 5000 par défaut. Vous pouvez modifier ce port dans le fichier server.js.

## Architecture

Le système de chat se compose de trois parties principales :

1. **Service Socket** (`socketService.js`) : Gère la connexion WebSocket avec le serveur et expose des méthodes pour envoyer et recevoir des messages.

2. **Contexte de Chat** (`ChatContext.js`) : Fournit un état global pour les conversations et les messages, accessible dans toute l'application.

3. **Interface Utilisateur** (`ChatInterface.js` et `ChatMessage.js`) : Les composants qui affichent les conversations et permettent aux utilisateurs d'interagir.

## Utilisation

### Intégration dans les composants

Pour utiliser le chat dans un composant, enveloppez-le avec le `ChatProvider` et utilisez le hook `useChat` :

```jsx
import { ChatProvider } from '../contexts/ChatContext';
import ChatInterface from './ChatInterface';

function MyComponent() {
  return (
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  );
}
```

### Envoyer un message

```jsx
import { useChat } from '../contexts/ChatContext';

function SendMessageButton({ recipientId }) {
  const { sendMessage } = useChat();
  
  const handleSend = () => {
    sendMessage(recipientId, 'Hello!');
  };
  
  return <button onClick={handleSend}>Envoyer</button>;
}
```

### Vérification de statut de message

Le système fournit trois états pour les messages :

1. **Envoyé** : Le message a été envoyé au serveur
2. **Livré** : Le message a été livré au destinataire
3. **Lu** : Le destinataire a lu le message

Ces états sont indiqués visuellement par des icônes dans l'interface de chat.

## Notes importantes

- Assurez-vous que le serveur Socket.IO est en cours d'exécution avant d'utiliser la fonctionnalité de chat
- Pour la production, mettez à jour l'URL du serveur dans `socketService.js`
- Les messages sont stockés en mémoire dans le serveur actuel. Pour une solution de production, implémentez un stockage persistant avec une base de données 