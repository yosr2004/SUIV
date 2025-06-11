// quizData.js - Base de données de quiz par catégorie et niveau
const quizData = {
  "Développement Web Frontend": {
    Débutant: [
      {
        question: "Quelle balise HTML est utilisée pour créer un lien hypertexte?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correctAnswer: "<a>",
        explanation:
          "La balise <a> (anchor) est utilisée pour créer des liens hypertextes en HTML.",
      },
      {
        question: "Quelle propriété CSS est utilisée pour changer la couleur du texte?",
        options: ["text-color", "font-color", "color", "text-style"],
        correctAnswer: "color",
        explanation: "La propriété 'color' est utilisée pour définir la couleur du texte en CSS.",
      },
      {
        question: "Quel type de langage est JavaScript?",
        options: [
          "Langage de balisage",
          "Langage de programmation",
          "Langage de feuilles de style",
          "Langage de base de données",
        ],
        correctAnswer: "Langage de programmation",
        explanation:
          "JavaScript est un langage de programmation qui permet d'implémenter des fonctionnalités complexes sur les pages web.",
      },
      {
        question: "Quelle est la signification de CSS?",
        options: [
          "Computer Style Sheets",
          "Creative Style System",
          "Cascading Style Sheets",
          "Colorful Style Sheets",
        ],
        correctAnswer: "Cascading Style Sheets",
        explanation:
          "CSS signifie Cascading Style Sheets, ou feuilles de style en cascade en français.",
      },
      {
        question: "Quel attribut HTML est utilisé pour définir des styles en ligne?",
        options: ["class", "style", "font", "css"],
        correctAnswer: "style",
        explanation:
          "L'attribut 'style' est utilisé pour appliquer des styles CSS directement à un élément HTML.",
      },
    ],
    Intermédiaire: [
      {
        question: "Quelle méthode JavaScript est utilisée pour sélectionner un élément par son ID?",
        options: [
          "document.query()",
          "document.getElementById()",
          "document.findElement()",
          "document.selectById()",
        ],
        correctAnswer: "document.getElementById()",
        explanation:
          "document.getElementById() est la méthode standard pour sélectionner un élément HTML par son attribut ID.",
      },
      {
        question: "Quelle propriété CSS est utilisée pour créer une grille?",
        options: ["grid-template", "display: grid", "grid-system", "flex-grid"],
        correctAnswer: "display: grid",
        explanation:
          "La propriété 'display: grid' est utilisée pour définir un conteneur comme une grille CSS.",
      },
      {
        question: "Quel hook React est utilisé pour gérer l'état d'un composant fonctionnel?",
        options: ["useEffect()", "useState()", "useContext()", "useReducer()"],
        correctAnswer: "useState()",
        explanation:
          "useState() est le hook React utilisé pour ajouter et gérer l'état local dans les composants fonctionnels.",
      },
      {
        question: "Quelle propriété CSS permet de créer des animations?",
        options: ["transform", "transition", "animation", "motion"],
        correctAnswer: "animation",
        explanation:
          "La propriété 'animation' en CSS est utilisée pour créer des animations complexes.",
      },
      {
        question:
          "Quel format de données est couramment utilisé pour échanger des données entre un client et un serveur?",
        options: ["HTML", "CSS", "JSON", "SQL"],
        correctAnswer: "JSON",
        explanation:
          "JSON (JavaScript Object Notation) est un format léger d'échange de données largement utilisé dans les applications web.",
      },
    ],
    Avancé: [
      {
        question: "Quelle est la différence entre 'let', 'const' et 'var' en JavaScript?",
        options: [
          "Ils sont identiques, juste des noms différents",
          "'let' et 'const' ont une portée de bloc, 'var' a une portée de fonction",
          "'var' est le plus récent",
          "'const' peut être réassigné contrairement à 'let'",
        ],
        correctAnswer: "'let' et 'const' ont une portée de bloc, 'var' a une portée de fonction",
        explanation:
          "'let' et 'const' ont été introduits en ES6 avec une portée de bloc, tandis que 'var' a une portée de fonction. De plus, 'const' ne peut pas être réassigné.",
      },
      {
        question: "Qu'est-ce que le 'Virtual DOM' dans React?",
        options: [
          "Une version simplifiée du DOM",
          "Une représentation en mémoire du DOM réel",
          "Un nouveau standard de W3C",
          "Une alternative à HTML",
        ],
        correctAnswer: "Une représentation en mémoire du DOM réel",
        explanation:
          "Le Virtual DOM est une représentation légère en mémoire du DOM réel. React l'utilise pour améliorer les performances en minimisant les manipulations directes du DOM.",
      },
      {
        question: "Qu'est-ce que la programmation fonctionnelle en JavaScript?",
        options: [
          "Une programmation avec beaucoup de fonctions",
          "Un paradigme qui traite le calcul comme l'évaluation de fonctions mathématiques",
          "Une façon d'organiser les fichiers JavaScript",
          "Un modèle ancien de programmation JavaScript",
        ],
        correctAnswer:
          "Un paradigme qui traite le calcul comme l'évaluation de fonctions mathématiques",
        explanation:
          "La programmation fonctionnelle est un paradigme où les programmes sont construits en appliquant et composant des fonctions, évitant les changements d'état et les données mutables.",
      },
      {
        question:
          "Quelle technique permet d'optimiser le chargement des images dans une application web?",
        options: ["Lazy loading", "Fast loading", "Quick loading", "Eager loading"],
        correctAnswer: "Lazy loading",
        explanation:
          "Le lazy loading est une technique qui retarde le chargement des images non visibles jusqu'à ce qu'elles soient sur le point d'entrer dans la viewport.",
      },
      {
        question: "Qu'est-ce qu'un 'Higher-Order Component' en React?",
        options: [
          "Un composant avec un style avancé",
          "Un composant qui prend en entrée un composant et retourne un nouveau composant",
          "Un composant qui utilise des hooks avancés",
          "Un composant avec plus de méthodes de cycle de vie",
        ],
        correctAnswer:
          "Un composant qui prend en entrée un composant et retourne un nouveau composant",
        explanation:
          "Un HOC est une fonction qui prend un composant et retourne un nouveau composant avec des fonctionnalités supplémentaires, permettant la réutilisation de logique.",
      },
    ],
  },

  "Développement Web Backend": {
    Débutant: [
      {
        question: "Quel langage est souvent utilisé côté serveur?",
        options: ["HTML", "CSS", "JavaScript", "PHP"],
        correctAnswer: "PHP",
        explanation:
          "PHP est un langage de script largement utilisé pour le développement côté serveur et la création de pages web dynamiques.",
      },
      {
        question: "Qu'est-ce qu'une API REST?",
        options: [
          "Une interface graphique",
          "Un style d'architecture pour les systèmes web",
          "Un protocole de sécurité",
          "Un format de base de données",
        ],
        correctAnswer: "Un style d'architecture pour les systèmes web",
        explanation:
          "REST (Representational State Transfer) est un style d'architecture qui définit un ensemble de contraintes pour créer des services web.",
      },
      {
        question:
          "Quel format de données est souvent utilisé pour la communication entre serveurs?",
        options: ["HTML", "XML", "CSV", "JSON"],
        correctAnswer: "JSON",
        explanation:
          "JSON est un format léger d'échange de données largement utilisé pour la communication entre serveurs et applications.",
      },
      {
        question: "Qu'est-ce qu'une route dans une application web?",
        options: [
          "Un chemin de fichier",
          "Un chemin URL associé à une fonction",
          "Une connexion de base de données",
          "Un protocole de sécurité",
        ],
        correctAnswer: "Un chemin URL associé à une fonction",
        explanation:
          "Une route dans une application web associe un chemin URL à une fonction ou méthode qui sera exécutée lorsque ce chemin est visité.",
      },
      {
        question: "Quelle méthode HTTP est généralement utilisée pour récupérer des données?",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctAnswer: "GET",
        explanation:
          "La méthode HTTP GET est utilisée pour demander des données d'une ressource spécifiée, sans modifier l'état du serveur.",
      },
    ],
    Intermédiaire: [
      {
        question: "Qu'est-ce qu'une base de données NoSQL?",
        options: [
          "Une base de données qui n'utilise pas SQL",
          "Une base de données non relationnelle",
          "Une base de données plus rapide que SQL",
          "Une base de données sans schéma prédéfini",
        ],
        correctAnswer: "Une base de données non relationnelle",
        explanation:
          "Les bases de données NoSQL sont conçues pour stocker, distribuer et accéder aux données en utilisant des modèles autres que les tables relationnelles.",
      },
      {
        question: "Qu'est-ce qu'un middleware dans Express.js?",
        options: [
          "Un type de serveur",
          "Une fonction qui a accès aux objets request et response",
          "Une bibliothèque de fonctions utilitaires",
          "Un type de base de données",
        ],
        correctAnswer: "Une fonction qui a accès aux objets request et response",
        explanation:
          "Un middleware est une fonction qui a accès aux objets request, response et à la fonction next dans le cycle de requête-réponse d'Express.",
      },
      {
        question:
          "Quelle technique est utilisée pour protéger contre les attaques par injection SQL?",
        options: [
          "Cryptographie",
          "Paramètres préparés",
          "Mots de passe forts",
          "Authentification à deux facteurs",
        ],
        correctAnswer: "Paramètres préparés",
        explanation:
          "Les paramètres préparés (ou requêtes paramétrées) empêchent l'injection SQL en séparant les données des instructions SQL.",
      },
      {
        question: "Qu'est-ce que l'authentification JWT?",
        options: [
          "Java Web Token",
          "JSON Web Token",
          "JavaScript Web Token",
          "Java With Technology",
        ],
        correctAnswer: "JSON Web Token",
        explanation:
          "JWT (JSON Web Token) est un standard ouvert qui définit une manière compacte et autonome de transmettre des informations entre parties sous forme d'objet JSON.",
      },
      {
        question: "Qu'est-ce que le scaling horizontal?",
        options: [
          "Ajouter plus de puissance à un serveur existant",
          "Ajouter plus de serveurs à votre infrastructure",
          "Réduire la taille de l'application",
          "Augmenter la bande passante du réseau",
        ],
        correctAnswer: "Ajouter plus de serveurs à votre infrastructure",
        explanation:
          "Le scaling horizontal consiste à ajouter plus de machines à votre pool de ressources, plutôt que d'ajouter des ressources à une seule machine (scaling vertical).",
      },
    ],
    Avancé: [
      {
        question: "Qu'est-ce que le sharding dans les bases de données?",
        options: [
          "Une technique de sauvegarde",
          "Une méthode de répartition des données sur plusieurs serveurs",
          "Un algorithme de compression",
          "Une stratégie de cache",
        ],
        correctAnswer: "Une méthode de répartition des données sur plusieurs serveurs",
        explanation:
          "Le sharding est une technique qui répartit de grandes bases de données en parties plus petites et plus faciles à gérer sur différents serveurs.",
      },
      {
        question: "Qu'est-ce que GraphQL par rapport à REST?",
        options: [
          "Un langage de requête pour les API",
          "Un nouveau type de base de données",
          "Un protocole de communication",
          "Un système de gestion de fichiers",
        ],
        correctAnswer: "Un langage de requête pour les API",
        explanation:
          "GraphQL est un langage de requête pour les API qui permet aux clients de demander exactement les données dont ils ont besoin, rien de plus, rien de moins.",
      },
      {
        question:
          "Quelle est la différence entre un microservice et une architecture monolithique?",
        options: [
          "Les microservices sont plus petits en taille de code",
          "Les microservices sont des applications séparées qui communiquent entre elles",
          "Les microservices utilisent toujours Docker",
          "Les microservices sont plus rapides",
        ],
        correctAnswer:
          "Les microservices sont des applications séparées qui communiquent entre elles",
        explanation:
          "Dans une architecture de microservices, l'application est composée de petits services indépendants qui communiquent via des API, contrairement à une architecture monolithique où tout est intégré dans une seule application.",
      },
      {
        question: "Qu'est-ce que le CQRS?",
        options: [
          "Centralized Query Response System",
          "Command Query Responsibility Segregation",
          "Cached Query Result Service",
          "Continuous Quality Review Strategy",
        ],
        correctAnswer: "Command Query Responsibility Segregation",
        explanation:
          "CQRS est un pattern qui sépare les opérations de lecture et d'écriture en différents modèles, permettant une meilleure performance, évolutivité et sécurité.",
      },
      {
        question: "Qu'est-ce que l'Event Sourcing?",
        options: [
          "Une méthode de débogage",
          "Une technique où les changements d'état sont stockés comme une séquence d'événements",
          "Un système de notification",
          "Une approche de programmation asynchrone",
        ],
        correctAnswer:
          "Une technique où les changements d'état sont stockés comme une séquence d'événements",
        explanation:
          "L'Event Sourcing est un pattern où les modifications apportées à l'état d'une application sont capturées dans une séquence d'événements immuables, plutôt que de simplement stocker l'état actuel.",
      },
    ],
  },

  "Développement Mobile": {
    Débutant: [
      {
        question: "Quel langage est utilisé pour développer des applications iOS natives?",
        options: ["Java", "Swift", "Kotlin", "C#"],
        correctAnswer: "Swift",
        explanation:
          "Swift est le langage de programmation moderne développé par Apple pour la création d'applications iOS, macOS, watchOS et tvOS.",
      },
      {
        question: "Qu'est-ce que React Native?",
        options: [
          "Un framework pour créer des applications web",
          "Un framework pour créer des applications mobiles natives avec JavaScript",
          "Un langage de programmation",
          "Un système d'exploitation mobile",
        ],
        correctAnswer: "Un framework pour créer des applications mobiles natives avec JavaScript",
        explanation:
          "React Native est un framework développé par Facebook qui permet de créer des applications mobiles natives pour iOS et Android en utilisant JavaScript et React.",
      },
      {
        question: "Quelle plateforme est associée à Android Studio?",
        options: ["iOS", "Windows Mobile", "Android", "BlackBerry"],
        correctAnswer: "Android",
        explanation:
          "Android Studio est l'environnement de développement intégré (IDE) officiel pour le développement d'applications Android.",
      },
      {
        question: "Qu'est-ce qu'un 'layout' dans le développement mobile?",
        options: [
          "La mise en page des éléments sur l'écran",
          "La taille de l'écran du dispositif",
          "Une image de fond",
          "Un type de fichier de configuration",
        ],
        correctAnswer: "La mise en page des éléments sur l'écran",
        explanation:
          "Un layout définit la structure visuelle pour une interface utilisateur, comme l'écran d'une application ou un widget.",
      },
      {
        question: "Qu'est-ce qu'une application 'responsive'?",
        options: [
          "Une application qui répond rapidement",
          "Une application qui s'adapte à différentes tailles d'écran",
          "Une application avec une interface utilisateur réactive",
          "Une application qui répond aux commandes vocales",
        ],
        correctAnswer: "Une application qui s'adapte à différentes tailles d'écran",
        explanation:
          "Une application responsive s'adapte automatiquement pour offrir une expérience utilisateur optimale sur différents dispositifs et tailles d'écran.",
      },
    ],
    Intermédiaire: [
      {
        question: "Qu'est-ce que Kotlin et pourquoi est-il populaire?",
        options: [
          "Un framework JavaScript pour le développement iOS",
          "Un langage de programmation officiellement supporté pour Android",
          "Un système de gestion de base de données mobile",
          "Un émulateur pour tester des applications mobiles",
        ],
        correctAnswer: "Un langage de programmation officiellement supporté pour Android",
        explanation:
          "Kotlin est un langage de programmation moderne officiellement supporté par Google pour le développement Android. Il est apprécié pour sa concision, sa sécurité et son interopérabilité avec Java.",
      },
      {
        question:
          "Quelle est la différence entre une application native et une application hybride?",
        options: [
          "Les applications natives sont gratuites, les hybrides sont payantes",
          "Les applications natives sont développées spécifiquement pour une plateforme, les hybrides fonctionnent sur plusieurs plateformes",
          "Les applications natives utilisent plus de mémoire que les hybrides",
          "Les applications natives nécessitent une connexion internet, pas les hybrides",
        ],
        correctAnswer:
          "Les applications natives sont développées spécifiquement pour une plateforme, les hybrides fonctionnent sur plusieurs plateformes",
        explanation:
          "Les applications natives sont développées dans le langage spécifique à une plateforme (Swift/Objective-C pour iOS, Java/Kotlin pour Android), tandis que les applications hybrides utilisent des technologies web dans un conteneur natif pour fonctionner sur plusieurs plateformes.",
      },
      {
        question: "Qu'est-ce que le 'hot reload' dans Flutter?",
        options: [
          "Une fonctionnalité qui permet de voir les changements de code instantanément sans perdre l'état",
          "Un mode de développement qui améliore les performances",
          "Une technique pour optimiser la consommation de batterie",
          "Une méthode pour déployer rapidement les applications",
        ],
        correctAnswer:
          "Une fonctionnalité qui permet de voir les changements de code instantanément sans perdre l'état",
        explanation:
          "Le hot reload de Flutter permet aux développeurs de voir immédiatement les effets des changements de code dans l'application en cours d'exécution, sans perdre l'état actuel de l'application.",
      },
      {
        question: "Qu'est-ce qu'une API RESTful dans le contexte des applications mobiles?",
        options: [
          "Une interface utilisateur",
          "Un protocole de communication entre l'application mobile et le serveur",
          "Un système de gestion de base de données",
          "Un environnement de test",
        ],
        correctAnswer: "Un protocole de communication entre l'application mobile et le serveur",
        explanation:
          "Une API RESTful est un style d'architecture qui définit comment les applications mobiles peuvent communiquer avec les serveurs via HTTP, généralement pour échanger des données au format JSON.",
      },
      {
        question:
          "Quelle est l'importance de la 'signature d'application' dans le développement mobile?",
        options: [
          "Elle permet d'authentifier le développeur de l'application",
          "Elle améliore les performances de l'application",
          "Elle réduit la taille de l'application",
          "Elle permet d'ajouter des animations personnalisées",
        ],
        correctAnswer: "Elle permet d'authentifier le développeur de l'application",
        explanation:
          "La signature d'application est un mécanisme de sécurité qui garantit que l'application provient d'une source connue et n'a pas été modifiée. C'est obligatoire pour publier sur les app stores.",
      },
    ],
    Avancé: [
      {
        question: "Qu'est-ce que l'architecture MVVM dans le développement mobile?",
        options: [
          "Mobile Virtual View Manager",
          "Model-View-ViewModel",
          "Multiple Virtual View Mechanism",
          "Mobile View Version Manager",
        ],
        correctAnswer: "Model-View-ViewModel",
        explanation:
          "MVVM (Model-View-ViewModel) est un pattern d'architecture qui sépare le développement de l'interface utilisateur de la logique métier et des données, facilitant le test unitaire et améliorant la maintenance du code.",
      },
      {
        question: "Qu'est-ce que la 'compilation ahead-of-time' (AOT)?",
        options: [
          "Une technique qui compile le code en temps réel pendant l'exécution",
          "Une méthode qui compile le code avant l'exécution de l'application",
          "Un système qui optimise l'espace de stockage des applications",
          "Une approche qui améliore les performances réseau des applications",
        ],
        correctAnswer: "Une méthode qui compile le code avant l'exécution de l'application",
        explanation:
          "La compilation AOT traduit le code source en code machine avant l'exécution de l'application, contrairement à la compilation just-in-time (JIT) qui se produit pendant l'exécution. Cela peut améliorer les performances de démarrage et d'exécution.",
      },
      {
        question: "Qu'est-ce que le 'deep linking' dans les applications mobiles?",
        options: [
          "Une technique d'optimisation des bases de données",
          "Un mécanisme permettant de lier des applications entre elles",
          "Un lien qui dirige les utilisateurs vers un contenu spécifique dans une application",
          "Une méthode pour stocker des données sensibles",
        ],
        correctAnswer:
          "Un lien qui dirige les utilisateurs vers un contenu spécifique dans une application",
        explanation:
          "Le deep linking permet d'utiliser des liens qui dirigent les utilisateurs vers un contenu spécifique à l'intérieur d'une application mobile, plutôt que simplement ouvrir la page d'accueil de l'application.",
      },
      {
        question: "Qu'est-ce que la 'réactivité' dans le contexte du développement mobile?",
        options: [
          "La vitesse à laquelle une application répond aux interactions",
          "Un paradigme de programmation où les données qui changent mettent automatiquement à jour l'interface",
          "La capacité d'une application à fonctionner hors ligne",
          "La fréquence à laquelle une application envoie des notifications",
        ],
        correctAnswer:
          "Un paradigme de programmation où les données qui changent mettent automatiquement à jour l'interface",
        explanation:
          "La programmation réactive est un paradigme où les changements dans les données sont automatiquement propagés à travers l'application, mettant à jour l'interface utilisateur sans intervention explicite du développeur.",
      },
      {
        question:
          "Qu'est-ce que le 'code signing certificate' dans le déploiement d'applications mobiles?",
        options: [
          "Un certificat qui vérifie le code pour détecter les bugs",
          "Un document qui confirme l'approbation de l'app store",
          "Un certificat numérique qui permet d'authentifier l'identité du développeur",
          "Un certificat qui garantit la compatibilité avec différents appareils",
        ],
        correctAnswer:
          "Un certificat numérique qui permet d'authentifier l'identité du développeur",
        explanation:
          "Un code signing certificate est un certificat numérique utilisé pour signer le code d'une application, confirmant que le code n'a pas été altéré et qu'il provient d'une source identifiable et de confiance.",
      },
    ],
  },

  DevOps: {
    Débutant: [
      {
        question: "Qu'est-ce que DevOps?",
        options: [
          "Un langage de programmation",
          "Une méthodologie qui combine le développement logiciel et les opérations IT",
          "Un outil de versionnage de code",
          "Un système d'exploitation pour serveurs",
        ],
        correctAnswer:
          "Une méthodologie qui combine le développement logiciel et les opérations IT",
        explanation:
          "DevOps est une approche qui combine les pratiques de développement logiciel (Dev) et d'opérations informatiques (Ops) pour raccourcir le cycle de développement et fournir des fonctionnalités en continu.",
      },
      {
        question: "Qu'est-ce que Git?",
        options: [
          "Un langage de programmation",
          "Un système de gestion de bases de données",
          "Un système de contrôle de version",
          "Un environnement de développement intégré",
        ],
        correctAnswer: "Un système de contrôle de version",
        explanation:
          "Git est un système de contrôle de version distribué qui permet aux développeurs de suivre les changements dans leur code, collaborer et gérer différentes versions.",
      },
      {
        question: "Qu'est-ce que Docker?",
        options: [
          "Un langage de programmation",
          "Une plateforme de conteneurisation",
          "Un système d'exploitation",
          "Un serveur web",
        ],
        correctAnswer: "Une plateforme de conteneurisation",
        explanation:
          "Docker est une plateforme qui permet de développer, déployer et exécuter des applications dans des conteneurs, ce qui facilite la portabilité et la cohérence entre différents environnements.",
      },
      {
        question: "Qu'est-ce que l'intégration continue (CI)?",
        options: [
          "La fusion de différentes bases de code",
          "Une pratique consistant à intégrer fréquemment les changements de code dans un dépôt partagé",
          "L'intégration de différents systèmes d'exploitation",
          "La combinaison de différents langages de programmation",
        ],
        correctAnswer:
          "Une pratique consistant à intégrer fréquemment les changements de code dans un dépôt partagé",
        explanation:
          "L'intégration continue est une pratique de développement où les membres d'une équipe intègrent fréquemment leur travail, avec des tests automatisés pour détecter rapidement les problèmes.",
      },
      {
        question: "Qu'est-ce qu'un pipeline CI/CD?",
        options: [
          "Un tuyau physique transportant des données",
          "Une série d'étapes automatisées pour livrer un logiciel",
          "Un langage de programmation pour DevOps",
          "Un protocole de communication entre serveurs",
        ],
        correctAnswer: "Une série d'étapes automatisées pour livrer un logiciel",
        explanation:
          "Un pipeline CI/CD est une série de processus automatisés qui permettent aux développeurs d'intégrer, tester et déployer continuellement les changements de code.",
      },
    ],
    Intermédiaire: [
      {
        question: "Qu'est-ce que Kubernetes?",
        options: [
          "Un langage de programmation pour l'IA",
          "Une plateforme d'orchestration de conteneurs",
          "Un système de gestion de bases de données",
          "Un protocole de sécurité réseau",
        ],
        correctAnswer: "Une plateforme d'orchestration de conteneurs",
        explanation:
          "Kubernetes est une plateforme open-source qui automatise le déploiement, la mise à l'échelle et la gestion des applications conteneurisées.",
      },
      {
        question:
          "Quelle est la différence entre Infrastructure as Code (IaC) et Configuration as Code?",
        options: [
          "IaC gère l'infrastructure, Configuration as Code gère la configuration des applications",
          "IaC est pour le cloud, Configuration as Code est pour les serveurs locaux",
          "IaC utilise des scripts, Configuration as Code utilise des fichiers YAML",
          "Il n'y a pas de différence, ce sont des synonymes",
        ],
        correctAnswer:
          "IaC gère l'infrastructure, Configuration as Code gère la configuration des applications",
        explanation:
          "L'Infrastructure as Code automatise le provisionnement des ressources d'infrastructure (serveurs, réseaux, etc.), tandis que la Configuration as Code gère la configuration des applications et services sur cette infrastructure.",
      },
      {
        question: "Qu'est-ce que Terraform?",
        options: [
          "Un service cloud de Google",
          "Un outil d'Infrastructure as Code",
          "Un système de surveillance",
          "Un langage de programmation pour DevOps",
        ],
        correctAnswer: "Un outil d'Infrastructure as Code",
        explanation:
          "Terraform est un outil open-source d'Infrastructure as Code qui permet de définir et de provisionner l'infrastructure à l'aide d'un langage déclaratif.",
      },
      {
        question: "Qu'est-ce que la livraison continue (CD)?",
        options: [
          "Un processus qui livre automatiquement le code aux clients",
          "Un processus qui garantit que le code peut être déployé à tout moment",
          "Un système de déploiement continu",
          "Un processus d'intégration de code",
        ],
        correctAnswer: "Un processus qui garantit que le code peut être déployé à tout moment",
        explanation:
          "La livraison continue est une pratique où les changements de code sont automatiquement préparés pour un déploiement en production, garantissant que le code est toujours dans un état déployable.",
      },
      {
        question: "Qu'est-ce que Prometheus?",
        options: [
          "Un outil de gestion de configuration",
          "Un outil de surveillance et d'alerte",
          "Un outil de conteneurisation",
          "Un outil de déploiement continu",
        ],
        correctAnswer: "Un outil de surveillance et d'alerte",
        explanation:
          "Prometheus est un système open-source de surveillance et d'alerte, conçu pour la fiabilité et l'évolutivité, particulièrement adapté aux environnements dynamiques comme Kubernetes.",
      },
    ],
    Avancé: [
      {
        question: "Qu'est-ce que le 'Service Mesh' dans l'architecture de microservices?",
        options: [
          "Un réseau de services interconnectés",
          "Une couche d'infrastructure dédiée à la gestion des communications entre services",
          "Un type de base de données distribuée",
          "Un modèle de déploiement pour les applications monolithiques",
        ],
        correctAnswer:
          "Une couche d'infrastructure dédiée à la gestion des communications entre services",
        explanation:
          "Un Service Mesh est une couche d'infrastructure qui gère la communication entre services dans une architecture de microservices, offrant des fonctionnalités comme la découverte de services, l'équilibrage de charge, et l'observabilité.",
      },
      {
        question: "Qu'est-ce que le 'GitOps'?",
        options: [
          "Une méthode pour optimiser les performances de Git",
          "Un framework de test pour les pipelines CI/CD",
          "Une approche où l'état souhaité d'un système est versionnée dans Git",
          "Un outil pour gérer les configurations Git",
        ],
        correctAnswer: "Une approche où l'état souhaité d'un système est versionnée dans Git",
        explanation:
          "GitOps est une pratique DevOps où l'état souhaité de l'infrastructure est déclaré et versionnée dans Git, et les changements sont automatiquement appliqués via des pipelines CI/CD.",
      },
      {
        question: "Qu'est-ce que le 'Chaos Engineering'?",
        options: [
          "Une méthode de développement sans structure",
          "Une pratique disciplinée d'expérimentation sur un système pour renforcer sa résilience",
          "Une technique de programmation non-linéaire",
          "Une approche de gestion d'équipe sans hiérarchie",
        ],
        correctAnswer:
          "Une pratique disciplinée d'expérimentation sur un système pour renforcer sa résilience",
        explanation:
          "Le Chaos Engineering est une pratique qui consiste à introduire délibérément des défaillances dans un système en production pour tester sa résilience et identifier les faiblesses avant qu'elles n'affectent les utilisateurs.",
      },
      {
        question: "Qu'est-ce que le 'Blue-Green Deployment'?",
        options: [
          "Un déploiement qui alterne entre environnements de développement et de production",
          "Une technique qui utilise des codes couleur pour les déploiements",
          "Une stratégie de déploiement avec deux environnements identiques",
          "Un modèle de déploiement écologique",
        ],
        correctAnswer: "Une stratégie de déploiement avec deux environnements identiques",
        explanation:
          "Le Blue-Green Deployment est une technique qui maintient deux environnements de production identiques, 'bleu' et 'vert'. Un seul est actif à la fois, permettant des mises à jour sans temps d'arrêt et un rollback rapide en cas de problème.",
      },
      {
        question: "Qu'est-ce que 'FinOps' dans le contexte DevOps?",
        options: [
          "Financial Operations - un département financier dédié aux équipes DevOps",
          "Une pratique qui combine finance et DevOps pour optimiser les coûts cloud",
          "Un outil de facturation pour les services cloud",
          "Une méthodologie pour financer les projets DevOps",
        ],
        correctAnswer: "Une pratique qui combine finance et DevOps pour optimiser les coûts cloud",
        explanation:
          "FinOps (Cloud Financial Operations) est une discipline qui réunit la finance, les opérations et la technologie pour gérer efficacement les dépenses cloud et optimiser les coûts tout en maintenant la rapidité et la qualité.",
      },
    ],
  },

  "Sécurité Informatique": {
    Débutant: [
      {
        question: "Qu'est-ce qu'une attaque par hameçonnage (phishing)?",
        options: [
          "Une tentative de surcharger un serveur",
          "Une tentative d'obtenir des informations sensibles en se faisant passer pour une entité de confiance",
          "Une attaque qui exploite les failles dans les logiciels",
          "Une méthode pour intercepter le trafic réseau",
        ],
        correctAnswer:
          "Une tentative d'obtenir des informations sensibles en se faisant passer pour une entité de confiance",
        explanation:
          "Le phishing est une technique frauduleuse où un attaquant se fait passer pour une entité de confiance afin d'inciter les victimes à partager des informations sensibles comme des mots de passe ou des numéros de carte de crédit.",
      },
      {
        question: "Qu'est-ce qu'un pare-feu (firewall)?",
        options: [
          "Un antivirus",
          "Un système qui surveille et contrôle le trafic réseau",
          "Un système de détection d'intrusion",
          "Un logiciel de cryptage",
        ],
        correctAnswer: "Un système qui surveille et contrôle le trafic réseau",
        explanation:
          "Un pare-feu est un système de sécurité qui surveille et filtre le trafic réseau entrant et sortant selon des règles de sécurité prédéfinies.",
      },
      {
        question: "Qu'est-ce que l'authentification à deux facteurs (2FA)?",
        options: [
          "Un système qui nécessite deux mots de passe",
          "Une méthode d'authentification qui requiert deux types de preuves d'identité",
          "Un système qui envoie le mot de passe à deux adresses email",
          "Une technique qui utilise deux serveurs différents pour l'authentification",
        ],
        correctAnswer:
          "Une méthode d'authentification qui requiert deux types de preuves d'identité",
        explanation:
          "L'authentification à deux facteurs est une méthode de sécurité qui requiert deux types d'informations pour vérifier l'identité, comme un mot de passe (quelque chose que vous savez) et un code SMS (quelque chose que vous possédez).",
      },
      {
        question: "Qu'est-ce qu'un mot de passe fort?",
        options: [
          "Un mot de passe avec au moins 8 caractères",
          "Un mot de passe qui contient uniquement des caractères spéciaux",
          "Un mot de passe long, complexe, avec différents types de caractères",
          "Un mot de passe que vous changez tous les jours",
        ],
        correctAnswer: "Un mot de passe long, complexe, avec différents types de caractères",
        explanation:
          "Un mot de passe fort est suffisamment long, combinant lettres majuscules et minuscules, chiffres et caractères spéciaux, sans utiliser d'informations personnelles facilement devinables.",
      },
      {
        question: "Qu'est-ce qu'une mise à jour de sécurité?",
        options: [
          "Une fonctionnalité qui bloque automatiquement les tentatives de piratage",
          "Un correctif logiciel qui répare les vulnérabilités connues",
          "Une notification qui informe des nouvelles menaces",
          "Un scan antivirus programmé",
        ],
        correctAnswer: "Un correctif logiciel qui répare les vulnérabilités connues",
        explanation:
          "Une mise à jour de sécurité est un correctif publié par les développeurs pour résoudre des vulnérabilités découvertes dans un logiciel, réduisant ainsi les risques d'exploitation par des attaquants.",
      },
    ],
    Intermédiaire: [
      {
        question: "Qu'est-ce qu'une attaque par injection SQL?",
        options: [
          "Une attaque qui injecte un virus dans une base de données",
          "Une technique où des commandes SQL malveillantes sont insérées dans les entrées de l'application",
          "Une méthode pour voler des données SQL via le réseau",
          "Un type de cryptage de base de données",
        ],
        correctAnswer:
          "Une technique où des commandes SQL malveillantes sont insérées dans les entrées de l'application",
        explanation:
          "Une injection SQL est une technique d'attaque où un attaquant insère des instructions SQL malveillantes dans les champs d'entrée d'une application pour manipuler la base de données, contourner l'authentification ou accéder aux données.",
      },
      {
        question: "Qu'est-ce que le chiffrement de bout en bout?",
        options: [
          "Un chiffrement qui ne fonctionne qu'aux extrémités d'un réseau",
          "Un système où les données sont chiffrées sur tout le trajet de l'expéditeur au destinataire",
          "Un chiffrement appliqué uniquement aux fichiers importants",
          "Une technique qui chiffre les données uniquement pendant la transmission",
        ],
        correctAnswer:
          "Un système où les données sont chiffrées sur tout le trajet de l'expéditeur au destinataire",
        explanation:
          "Le chiffrement de bout en bout assure que les données sont chiffrées sur l'appareil de l'expéditeur et ne peuvent être déchiffrées que par le destinataire prévu, empêchant l'accès même par les fournisseurs de service qui transmettent les données.",
      },
      {
        question: "Qu'est-ce qu'une attaque par déni de service distribué (DDoS)?",
        options: [
          "Une attaque qui supprime les services d'un serveur",
          "Une tentative de rendre une ressource en ligne indisponible en la surchargeant de trafic depuis de multiples sources",
          "Une attaque qui distribue des virus à plusieurs ordinateurs",
          "Un virus qui désactive les logiciels antivirus",
        ],
        correctAnswer:
          "Une tentative de rendre une ressource en ligne indisponible en la surchargeant de trafic depuis de multiples sources",
        explanation:
          "Une attaque DDoS tente de rendre un service en ligne inaccessible en le submergeant de trafic provenant de nombreuses sources différentes, souvent des réseaux d'ordinateurs infectés (botnets).",
      },
      {
        question: "Qu'est-ce que la gestion des vulnérabilités?",
        options: [
          "Une technique pour créer des logiciels sans bugs",
          "Un processus cyclique d'identification, de classification et d'atténuation des vulnérabilités",
          "Une méthode pour rendre les systèmes invulnérables",
          "Un système qui détecte automatiquement les intrusions",
        ],
        correctAnswer:
          "Un processus cyclique d'identification, de classification et d'atténuation des vulnérabilités",
        explanation:
          "La gestion des vulnérabilités est un processus de sécurité qui identifie, évalue, traite et rapporte les vulnérabilités dans les systèmes et les logiciels, généralement de manière cyclique et continue.",
      },
      {
        question: "Qu'est-ce que le principe du moindre privilège?",
        options: [
          "Donner le minimum de privilèges nécessaires à un utilisateur ou processus",
          "Réserver les privilèges aux administrateurs système",
          "Limiter l'accès à internet des utilisateurs",
          "Supprimer les privilèges des utilisateurs non fiables",
        ],
        correctAnswer: "Donner le minimum de privilèges nécessaires à un utilisateur ou processus",
        explanation:
          "Le principe du moindre privilège stipule qu'un utilisateur, programme ou système ne devrait avoir que les privilèges minimaux nécessaires pour accomplir sa tâche, réduisant ainsi l'exposition aux risques de sécurité.",
      },
    ],
    Avancé: [
      {
        question: "Qu'est-ce que la sécurité Zero Trust?",
        options: [
          "Un modèle où aucun utilisateur n'a de privilèges administratifs",
          "Un cadre de sécurité qui ne fait confiance à personne par défaut, qu'il soit à l'intérieur ou à l'extérieur du réseau",
          "Une politique qui interdit l'utilisation d'appareils personnels",
          "Un système qui bloque tout le trafic internet",
        ],
        correctAnswer:
          "Un cadre de sécurité qui ne fait confiance à personne par défaut, qu'il soit à l'intérieur ou à l'extérieur du réseau",
        explanation:
          "La sécurité Zero Trust est une approche qui ne fait confiance à aucun utilisateur ou appareil par défaut, même à l'intérieur du périmètre du réseau, et requiert une vérification continue pour chaque accès aux ressources.",
      },
      {
        question: "Qu'est-ce que l'analyse des menaces persistantes avancées (APT)?",
        options: [
          "Un scan antivirus approfondi",
          "Une analyse des attaques prolongées et ciblées visant des organisations spécifiques",
          "Un système qui détecte les virus avancés",
          "Une méthode pour tester la persistance des pare-feu",
        ],
        correctAnswer:
          "Une analyse des attaques prolongées et ciblées visant des organisations spécifiques",
        explanation:
          "L'analyse des APT se concentre sur la détection et l'étude des cyberattaques sophistiquées, prolongées et ciblées, souvent menées par des acteurs bien financés comme des États ou des groupes criminels organisés.",
      },
      {
        question: "Qu'est-ce que le 'threat hunting' proactif?",
        options: [
          "Une méthode automatisée de détection des menaces",
          "La recherche active et itérative de menaces qui échappent aux défenses existantes",
          "Une technique pour bloquer proactivement toutes les connexions suspectes",
          "Un système qui prédit les futures cyberattaques",
        ],
        correctAnswer:
          "La recherche active et itérative de menaces qui échappent aux défenses existantes",
        explanation:
          "Le threat hunting proactif est un processus de recherche active de menaces qui ont échappé aux détections automatisées, impliquant des analyses manuelles et semi-manuelles des données et comportements sur le réseau.",
      },
      {
        question: "Qu'est-ce que l'analyse de code statique automatisée (SAST)?",
        options: [
          "Un test de performance du code",
          "Une analyse du code source sans l'exécuter pour identifier des vulnérabilités potentielles",
          "Un système qui génère automatiquement du code sécurisé",
          "Une méthode pour optimiser la taille du code",
        ],
        correctAnswer:
          "Une analyse du code source sans l'exécuter pour identifier des vulnérabilités potentielles",
        explanation:
          "Le SAST est une technologie qui analyse le code source ou compilé sans l'exécuter, pour identifier des vulnérabilités de sécurité potentielles comme les injections SQL, les débordements de tampon, etc.",
      },
      {
        question: "Qu'est-ce que la 'cyber threat intelligence'?",
        options: [
          "Un système d'intelligence artificielle qui détecte les cyberattaques",
          "Des informations sur les menaces et les attaquants qui aident à la prise de décision en cybersécurité",
          "Une base de données de virus connus",
          "Un système de surveillance du dark web",
        ],
        correctAnswer:
          "Des informations sur les menaces et les attaquants qui aident à la prise de décision en cybersécurité",
        explanation:
          "La cyber threat intelligence est la collecte, l'analyse et la diffusion d'informations sur les menaces, les acteurs malveillants et leurs tactiques, techniques et procédures, afin d'améliorer la prise de décision en matière de cybersécurité.",
      },
    ],
  },
};

export default quizData;
