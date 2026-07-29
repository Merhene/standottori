# Guide d’administration — Standottori

Document destiné à l’artiste pour gérer le contenu du site **standottori.com** au quotidien.

L’interface d’administration est en **français**.  
Adresse d’accès : **`https://standottori.com/admin`**  
(ou `/admin` sur le domaine en ligne)

---

## Sommaire

1. [Connexion et déconnexion](#1-connexion-et-déconnexion)
2. [Vue d’ensemble](#2-vue-densemble)
3. [Événements](#3-événements)
4. [Galerie](#4-galerie)
5. [Biographie](#5-biographie)
6. [Informations (contact & réseaux)](#6-informations-contact--réseaux)
7. [Paramètres](#7-paramètres)
8. [Playground (tests)](#8-playground-tests)
9. [Ce que voient les visiteurs](#9-ce-que-voient-les-visiteurs)
10. [Formulaire de contact → vos e-mails](#10-formulaire-de-contact--vos-e-mails)
11. [Écran de verrouillage (entrée du site)](#11-écran-de-verrouillage-entrée-du-site)
12. [Conseils et limites](#12-conseils-et-limites)

---

## 1. Connexion et déconnexion

### Se connecter

1. Ouvrir **`/admin`** (ou `/admin/login`).
2. Saisir l’**e-mail** et le **mot de passe** administrateur fournis à la livraison.
3. Cliquer sur **Se connecter**.

En cas d’erreur : message *« Identifiants incorrects. Veuillez réessayer. »*

### Se déconnecter

1. Aller dans **Paramètres**.
2. En bas, section **Compte administrateur** → bouton **Déconnexion**.

Vous êtes renvoyé sur la page d’accueil publique.

> **Astuce :** gardez vos identifiants en lieu sûr. Le site n’autorise pas la création de nouveaux comptes depuis l’interface — un seul compte admin.

---

## 2. Vue d’ensemble

Après connexion, la page **Administration** propose des cartes :

| Carte | À quoi ça sert |
|--------|----------------|
| **Événements** | Dates, lieux, carte publique |
| **Galerie** | Photos Tattoo, Flash, et fonds d’écran d’accueil |
| **Biographie** | Texte FR/EN + images de la page bio |
| **Informations** | E-mail, téléphone, adresse, réseaux sociaux |
| **Paramètres** | Écran de verrouillage, mot de passe, déconnexion |
| **Playground** | Zone de test (invisible pour les clients) |

Chaque carte mène à une section. Un fil d’Ariane (**Administration / …**) permet de remonter facilement.

---

## 3. Événements

**Chemin :** Administration → **Événements**  
**Page publique :** `/events`

### Ce que vous pouvez faire

- **Ajouter un événement**
- **Modifier** un événement existant
- **Supprimer** un événement (confirmation demandée)

### Champs

| Champ | Obligatoire | Description |
|--------|-------------|-------------|
| **Titre** | Oui | Nom de l’événement |
| **Date** | Oui | Date affichée sur le site |
| **Lieu (recherche carte)** | Non | Tapez une ville (ex. Paris), choisissez une suggestion pour placer l’épingle sur la carte |
| **Statut** | Oui | **À venir** / **Passé** / **Annulé** |
| **Description** | Non | Texte libre |

### Carte

- Après choix d’une suggestion de lieu, un **pin** (coordonnées) est enregistré.
- Vous pouvez **retirer** le pin si besoin.
- Sans pin : l’événement apparaît dans la liste mais **pas sur la carte**.

### Statuts

- **À venir** et **Passé** : visibles sur le site.
- **Annulé** : **masqué** pour les visiteurs (reste visible dans l’admin pour historique).

> Les événements sont en **une seule langue** (celle que vous saisissez). Pas de version FR/EN séparée.

---

## 4. Galerie

**Chemin :** Administration → **Galerie**

Trois catégories :

| Catégorie | Contenu | Page publique |
|-----------|---------|---------------|
| **Tattoo** | Tattoos réalisés | `/gallery/book` |
| **Flash** | Dessins proposés (non tatoués) | `/gallery/flash` |
| **Wallpaper** | Fonds d’écran de l’accueil | Page d’accueil `/` (carrousel) |
| **Cover** | Images des panneaux Book / Flash | Hub `/gallery` |

Sur le hub Galerie, chaque carte affiche le **nombre d’images** (`N image(s)`).

### Ajouter des images

1. Ouvrir la catégorie (**Gérer**).
2. Cliquer sur **Ajouter des images**.
3. Sélectionner une ou plusieurs photos (JPEG, PNG ou WebP).
4. L’envoi compresse automatiquement les images (qualité web).

### Supprimer une image

Icône poubelle sur l’image → confirmation → suppression définitive (fichier + affichage public).

### Wallpaper (page d’accueil)

- Ces images alimentent le **carrousel** après le logo néon.
- S’il n’y a **aucune** wallpaper : l’accueil n’affiche que le **logo** (pas d’anciennes images de démo).

### Cover (hub Galerie)

- Deux emplacements : **Book** (panneau gauche) et **Flash** (panneau droit) sur `/gallery`.
- Remplacez chaque image avec **Ajouter / Changer l’image**.
- Tant qu’une cover n’est pas uploadée, une image par défaut reste affichée.

### Flash et demandes clients

Sur la galerie Flash publique, un visiteur peut **demander un flash** : il est redirigé vers le formulaire Contact avec l’image jointe.

### Limites utiles

- Formats acceptés : **JPEG, PNG, WebP**.
- Le **titre** enregistré = nom du fichier (sans extension) — pas d’édition de titre ni de réordonnancement dans l’admin pour l’instant.
- Ordre d’affichage : ordre technique d’enregistrement (pas de glisser-déposer).

---

## 5. Biographie

**Chemin :** Administration → **Biographie**  
**Page publique :** `/biography`

### Texte bilingue (FR + EN)

1. Choisir la langue avec les boutons **Français** / **English**.
2. Remplir **Titre** et **Contenu** pour chaque langue.
3. Cliquer sur **Enregistrer** (les **deux** langues sont sauvées ensemble).

**Règle importante :** si l’anglais est vide, le site affiche le **français**.

Astuce rédaction : laissez une **ligne vide** entre deux paragraphes pour les séparer à l’écran.

### Images

| Zone | Rôle | Enregistrement |
|------|------|----------------|
| **Photo de profil** | Portrait | Automatique à l’upload |
| **Image 1 — haut** | Grande image (haut de page) | Automatique |
| **Image 2 — bas** | Grande image (bas de page) | Automatique |
| **Carrousel** | Petites images en défilement | Automatique (max **12**) |

- Boutons : **Changer la photo** / **Ajouter une image** / **Ajouter des images**.
- Carrousel plein : bouton **Limite atteinte**.
- Carrousel vide : le site utilise des **images par défaut**.

> Le fond animé (logo / zoom) de la page biographie n’est **pas** modifiable depuis l’admin.

---

## 6. Informations (contact & réseaux)

**Chemin :** Administration → **Informations**  
Bouton **Enregistrer** → message *Informations enregistrées.*

### Contact (page Contact publique)

| Champ | Affiché sur le site |
|--------|---------------------|
| **Email** | Coordonnées + **destinataire des messages du formulaire** |
| **Téléphone** | Coordonnées |
| **Adresse** | Coordonnées |

### Réseaux sociaux (pied de page)

| Champ | Affichage |
|--------|-----------|
| **Instagram** | Footer |
| **YouTube** | Footer + page YouTube du site |
| **TikTok** | Footer |

Laissez un champ vide pour ne pas afficher ce réseau.

### URL du formulaire

Champ **URL du formulaire** : lien optionnel affiché sur Contact (**Ouvrir le formulaire**), en plus du formulaire intégré du site.

> **Important :** l’e-mail renseigné ici est celui qui **reçoit** les demandes envoyées via le formulaire Contact. Vérifiez qu’il est correct.

---

## 7. Paramètres

**Chemin :** Administration → **Paramètres**

### Écran de verrouillage

- Interrupteur **Écran de verrouillage**.
- **Activé** : motif d’entrée au premier passage sur le site.
- **Désactivé** : accès direct au site.

### Mot de passe

Section **Compte administrateur** :

1. Saisir un **Nouveau mot de passe** (minimum **8** caractères).
2. Cliquer sur **Modifier**.

### Déconnexion

Bouton **Déconnexion** (voir §1).

### Thème / SEO (à savoir)

Les champs **Thème par défaut** et **SEO** (titre, description, mots-clés) peuvent être enregistrés, mais aujourd’hui :

- le site s’ouvre en **mode sombre** par défaut (le visiteur peut toujours basculer clair/sombre avec le bouton du header) ;
- les champs SEO admin ne remplacent pas encore automatiquement les balises du site.

Vous pouvez les remplir pour plus tard ; ce n’est pas bloquant pour le quotidien.

---

## 8. Playground (tests)

**Chemin :** Administration → **Playground** (ou menu **Playground** une fois connecté)

- Zone de **test** (logo, écran de verrouillage, etc.).
- **Invisible** pour les visiteurs non connectés.
- Utile pour retester le motif d’entrée sans perturber votre navigation habituelle.

---

## 9. Ce que voient les visiteurs

| Vous modifiez dans l’admin… | Les visiteurs le voient sur… |
|-----------------------------|------------------------------|
| Wallpaper | Accueil (carrousel après le logo) |
| Tattoo / Flash | Galerie Book / Flash |
| Événements + pin | Page Événements + carte |
| Biographie FR/EN + images | Page Biographie |
| E-mail, tél, adresse | Page Contact |
| Instagram / YouTube / TikTok | Pied de page (et YouTube) |
| Écran de verrouillage on/off | Entrée du site |

Les changements sont en général **immédiats** après enregistrement / upload (parfois un rafraîchissement de page côté navigateur).

---

## 10. Formulaire de contact → vos e-mails

Quand un client envoie le formulaire sur **/contact** :

1. Un e-mail part vers l’adresse définie dans **Informations → Email**.
2. Vous pouvez **répondre directement** : le *Reply-To* est l’adresse du client.
3. Le sujet indique le type de demande, par exemple :  
   `[Tatouage] Message de … via standottori.com`  
   (aussi : Partenariat, Invitation, Informations).

Le formulaire peut inclure :

- catégorie de demande ;
- budget / zones (selon le type) ;
- pièces jointes (images) ;
- flash pré-sélectionné depuis la galerie Flash.

> Vérifiez régulièrement votre boîte mail (et les indésirables au début).  
> Si aucun message n’arrive : contrôlez d’abord le champ **Email** dans Informations.

---

## 11. Écran de verrouillage (entrée du site)

À l’arrivée sur le site (si activé dans Paramètres) :

- le visiteur voit un **motif** à relier (points numérotés) ;
- boutons **Recommencer** et option d’entrée accessible ;
- après **environ 20 secondes** sans action, le site s’ouvre quand même ;
- une fois passé (motif **ou** délai), le navigateur **mémorise** la visite : l’écran ne se représente plus à chaque fois (sauf navigation privée / cache vidé).

Le motif lui-même n’est **pas modifiable** depuis l’admin (choix artistique figé dans le site).

Pour le retester : utilisez le **Playground**, ou videz les données du site dans le navigateur (clé `lockscreen-completed`).

---

## 12. Conseils et limites

### Bonnes pratiques

- Préférez des photos **nettes**, déjà cadrées ; la compression web est automatique.
- Pour les Wallpaper : images **paysage / plein écran** rendent mieux sur mobile et desktop.
- Remplissez la biographie en **FR et EN** si vous visez un public international.
- Gardez l’**e-mail Informations** à jour : c’est votre boîte de demandes.
- Après une grosse mise à jour, ouvrez le site en navigation privée pour voir comme un nouveau client.

### Ce qui n’est pas géré dans l’admin

- Logos / identité visuelle du site (fichiers techniques)
- Texte des menus et pages légales (Mentions / Confidentialité)
- Vidéos YouTube individuelles (seule l’URL de chaîne vient des Infos)
- Motif de l’écran de verrouillage
- Création d’un second compte administrateur

### En cas de problème

1. Se déconnecter / reconnecter.
2. Rafraîchir la page (Ctrl+F5).
3. Vérifier que vous êtes bien sur le bon domaine (site en ligne, pas une ancienne version).
4. Contacter la personne qui a livré le site avec une capture d’écran + la page concernée.

---

## Accès rapide

| Action | Où |
|--------|-----|
| Se connecter | `/admin` |
| Ajouter un tattoo | Galerie → Tattoo → Ajouter des images |
| Changer le fond d’accueil | Galerie → Wallpaper |
| Publier un événement | Événements → Ajouter un événement |
| Modifier la bio | Biographie → FR/EN → Enregistrer |
| Changer l’e-mail de réception | Informations → Email → Enregistrer |
| Couper le lockscreen | Paramètres → Écran de verrouillage |
| Changer le mot de passe | Paramètres → Nouveau mot de passe |
| Se déconnecter | Paramètres → Déconnexion |

---

*Guide Standottori — panneau d’administration. Version livraison v1.*
