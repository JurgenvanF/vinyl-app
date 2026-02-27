type Locale = "en" | "nl";

type Translations = {
  [key in Locale]: {
    welcome: string;
    welcomeDescription: string;
    welcomeFooter: string;
    productBy: string;
    by: string;
    login: string;
    register: string;
    email: string;
    emailAlreadyInUse: string;
    password: string;
    firstName: string;
    lastName: string;
    signUp: string;
    signInInstructions: string;
    signInError: string;
    invalidEmailOrPassword: string;
    signUpError: string;
    logout: string;
    loginSuccess: string;
    registerSuccess: string;
    logoutSuccess: string;
    logoutError: string;
    helloName: (name: string) => string;
    loading: string;
    myCollection: string;
    wishlist: string;
    profile: string;
    profileLoadError: string;
    searchAlbumArtist: string;
    searchAlbumArtistCatNo: string;
    searchTakingLonger: string;
    addAlbum: string;
    recentlyAdded: string;
    searchDatabase: string;
    remove: string;
    viewDetails: string;
    collection: string;
    addToCollectionTitle: string;
    addedToCollection: string;
    errorAddToCollection: string;
    removedFromCollection: string;
    confirmRemoveFromCollection: string;
    errorRemovedFromCollection: string;
    toCollection: string;
    moveToCollection: (albumTitle: string) => string;
    moveToCollectionMessage: string;
    movedToCollection: string;
    addedToWishlist: string;
    errorAddToWishlist: string;
    removedFromWishlist: string;
    confirmRemoveFromWishlist: string;
    errorRemovedFromWishlist: string;
    noMatch: string;
    scanBarcode: string;
    scanBarcodeInstruction: string;
    activateCamera: string;
    customEntry: string;
    albumName: string;
    artist: string;
    genre: string;
    releaseDate: string;
    type: string;
    nrOfRecords: string;
    duration: string;
    labelNr: string;
    coverImage: string;
    Tracklist: string;
    addTrack: string;
    title: string;
    confirm: string;
    cancel: string;
    addImage: string;
    unknownArtist: string;
    unknownYear: string;
    noAlbumsFound: string;
    collectionCount: (visible: number, total: number) => string;
    albumCount: (count: number) => string;
  };
};

export const translations: Translations = {
  en: {
    welcome: "Manage your Vinyl Collection",
    welcomeDescription:
      "The app for vinyl collectors to catalog, organize, and share their music collections",
    welcomeFooter: "Start building your vinyl collection today",
    productBy: "A product by",
    by: "by",
    login: "Login",
    register: "Register",
    email: "Email",
    emailAlreadyInUse: "This email address is already in use.",
    password: "Password",
    firstName: "First Name",
    lastName: "Last Name",
    signUp: "Sign Up",
    signInInstructions: "Sign in to your account or create a new one",
    signInError: "Something went wrong during login.",
    invalidEmailOrPassword: "Email or password is incorrect.",
    signUpError: "Something went wrong during registration.",
    logout: "Logout",
    loginSuccess: "Logged in successfully.",
    registerSuccess: "Account created successfully.",
    logoutSuccess: "Logged out successfully.",
    logoutError: "Something went wrong during logout.",
    helloName: (name) => `Hello, ${name}!`,
    loading: "Loading...",
    myCollection: "My Collection",
    wishlist: "Wishlist",
    profile: "Profile",
    profileLoadError: "Could not load your profile. Please try again.",
    searchAlbumArtist: "Search albums or artists",
    searchAlbumArtistCatNo: "Search albums, artists or catalog numbers",
    searchTakingLonger: "Searching is taking a bit longer than usual...",
    addAlbum: "Add Album",
    recentlyAdded: "Recently added",
    searchDatabase: "Search Database",
    remove: "Remove",
    viewDetails: "Details",
    collection: "Collection",
    addToCollectionTitle: "Add Album to Collection",
    addedToCollection: "Added to your collection",
    errorAddToCollection: "Something went wrong adding to your collection",
    removedFromCollection: "Removed from your collection",
    confirmRemoveFromCollection:
      "Are you sure you want to remove this album from your collection",
    errorRemovedFromCollection:
      "Something went wrong removing from your collection",
    toCollection: "To collection",
    moveToCollection: (albumTitle) => `Move ${albumTitle} to collection`,
    moveToCollectionMessage:
      "Do you want to remove this album from the wishlist and add it to your collection",
    movedToCollection: "moved to your collection",
    addedToWishlist: "Added to your wishlist",
    errorAddToWishlist: "Something went wrong adding to wishlist",
    removedFromWishlist: "Removed from your wishlist",
    confirmRemoveFromWishlist:
      "Are you sure you want to remove this album from your wishlist",
    errorRemovedFromWishlist:
      "Something went wrong removing from your wishlist",
    noMatch:
      "Can't find your result in this list? Try searching for the catalog number, scan the barcode or add it manually.",
    scanBarcode: "Scan Barcode",
    scanBarcodeInstruction:
      "Click the button below to activate your camera and scan a barcode",
    activateCamera: "Activate Camera",
    customEntry: "Custom Entry",
    albumName: "Album Name",
    artist: "Artist",
    genre: "Genre",
    releaseDate: "Release Date",
    type: "Type",
    nrOfRecords: "Number of Records",
    duration: "Duration",
    labelNr: "Catalog nr",
    coverImage: "Cover Image",
    Tracklist: "Tracklist",
    addTrack: "Add Track",
    title: "Title",
    confirm: "Confirm",
    cancel: "Cancel",
    addImage: "Add Image",
    unknownArtist: "Unknown artist",
    unknownYear: "Unknown year",
    noAlbumsFound: "No albums found.",
    collectionCount: (visible, total) => `${visible} of ${total} albums`,
    albumCount: (count) => `${count} ${count === 1 ? "album" : "albums"}`,
  },
  nl: {
    welcome: "Beheer uw Vinyl Collectie",
    welcomeDescription:
      "De app voor vinylverzamelaars om hun muziekcollecties te catalogiseren, ordenen en delen",
    welcomeFooter: "Begin vandaag nog met het opbouwen van uw vinylcollectie",
    productBy: "Een product van",
    by: "door",
    login: "Inloggen",
    register: "Registreren",
    email: "E-mail",
    emailAlreadyInUse: "Dit e-mailadres is al in gebruik.",
    password: "Wachtwoord",
    firstName: "Voornaam",
    lastName: "Achternaam",
    signUp: "Registreren",
    signInInstructions: "Log in op uw account of maak een nieuwe aan",
    signInError: "Er is iets misgegaan bij het inloggen.",
    invalidEmailOrPassword: "E-mailadres of wachtwoord is onjuist.",
    signUpError: "Er is iets misgegaan bij het registreren.",
    logout: "Uitloggen",
    loginSuccess: "Succesvol ingelogd.",
    registerSuccess: "Account succesvol aangemaakt.",
    logoutSuccess: "Succesvol uitgelogd.",
    logoutError: "Er is iets misgegaan bij het uitloggen.",
    helloName: (name) => `Hallo, ${name}!`,
    loading: "Laden...",
    myCollection: "Mijn Collectie",
    wishlist: "Verlanglijst",
    profile: "Profiel",
    profileLoadError: "Kan je profiel niet laden. Probeer het opnieuw.",
    searchAlbumArtist: "Zoek albums of artiesten",
    searchAlbumArtistCatNo: "Zoek albums, artiesten of catalogusnummers",
    searchTakingLonger: "Zoeken duurt iets langer dan normaal...",
    addAlbum: "Album toevoegen",
    recentlyAdded: "Recent toegevoegd",
    searchDatabase: "Database doorzoeken",
    remove: "Verwijder",
    viewDetails: "Details",
    collection: "Collectie",
    addToCollectionTitle: "Album toevoegen aan collectie",
    addedToCollection: "Toegevoegd aan je collectie",
    errorAddToCollection:
      "Er is iets misgegaan bij het toevoegen aan de collectie",
    removedFromCollection: "Verwijderd uit je collectie",
    confirmRemoveFromCollection:
      "Weet je zeker dat je dit album uit je collectie wilt verwijderen",
    errorRemovedFromCollection:
      "Er is iets misgegaan bij het verwijderen uit je collectie",
    toCollection: "Naar collectie",
    moveToCollection: (albumTitle) =>
      `Verplaats ${albumTitle} naar collectie`,
    moveToCollectionMessage:
      "Wil je dit album verwijderen van je verlanglijstje en toevoegen aan je collectie",
    movedToCollection: "verplaatst naar je collectie",
    addedToWishlist: "Toegevoegd aan je verlanglijst",
    errorAddToWishlist:
      "Er is iets misgegaan bij het toevoegen aan de verlanglijst",
    removedFromWishlist: "Verwijderd uit je verlanglijst",
    confirmRemoveFromWishlist:
      "Weet je zeker dat je dit album uit je verlanglijst wilt verwijderen",
    errorRemovedFromWishlist:
      "Er is iets misgegaan bij het verwijderen uit je verlanglijst",
    noMatch:
      "Resultaat staat niet in de lijst? Probeer te zoeken met het catalogusnummer, scan de barcode of voeg hem handmatig toe.",
    scanBarcode: "Barcode scannen",
    scanBarcodeInstruction:
      "Klik op de knop hieronder om je camera te activeren en een barcode te scannen",
    activateCamera: "Camera activeren",
    customEntry: "Handmatige invoer",
    albumName: "Albumnaam",
    artist: "Artiest",
    genre: "Genre",
    releaseDate: "Releasedatum",
    type: "Type",
    nrOfRecords: "Aantal platen",
    duration: "Duur",
    labelNr: "Catalogusnr.",
    coverImage: "Omslagafbeelding",
    Tracklist: "Tracklijst",
    addTrack: "Track toevoegen",
    title: "Titel",
    confirm: "Bevestigen",
    cancel: "Annuleren",
    addImage: "Afbeelding toevoegen",
    unknownArtist: "Onbekende artiest",
    unknownYear: "Onbekend jaar",
    noAlbumsFound: "Geen albums gevonden.",
    collectionCount: (visible, total) => `${visible} van ${total} albums`,
    albumCount: (count) => `${count} ${count === 1 ? "album" : "albums"}`,
  },
};

export const t = (
  locale: Locale,
  key: keyof Translations["en"],
  ...args: any[]
): string => {
  const value = translations[locale][key];
  if (typeof value === "function")
    return (value as (...args: any[]) => string)(...args);
  return value;
};
