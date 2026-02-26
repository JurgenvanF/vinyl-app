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
    password: string;
    firstName: string;
    lastName: string;
    signUp: string;
    signInInstructions: string;
    signInError: string;
    logout: string;
    helloName: (name: string) => string;
    loading: string;
    myCollection: string;
    wishlist: string;
    profile: string;
    profileLoadError: string;
    searchAlbumArtist: string;
    searchAlbumArtistCatNo: string;
    addAlbum: string;
    searchDatabase: string;
    remove: string;
    viewDetails: string;
    addToCollection: string;
    addToCollectionTitle: string;
    addToWishlist: string;
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
    cancel: string;
    addImage: string;
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
    password: "Password",
    firstName: "First Name",
    lastName: "Last Name",
    signUp: "Sign Up",
    signInInstructions: "Sign in to your account or create a new one",
    signInError: "Something went wrong during login.",
    logout: "Logout",
    helloName: (name) => `Hello, ${name}!`,
    loading: "Loading...",
    myCollection: "My Collection",
    wishlist: "Wishlist",
    profile: "Profile",
    profileLoadError: "Could not load your profile. Please try again.",
    searchAlbumArtist: "Search albums or artists",
    searchAlbumArtistCatNo: "Search albums, artists or catalog numbers",
    addAlbum: "Add Album",
    searchDatabase: "Search Database",
    remove: "Remove",
    viewDetails: "Details",
    addToCollection: "Collection",
    addToCollectionTitle: "Add Album to Collection",
    addToWishlist: "Wishlist",
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
    cancel: "Cancel",
    addImage: "Add Image",
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
    password: "Wachtwoord",
    firstName: "Voornaam",
    lastName: "Achternaam",
    signUp: "Registreren",
    signInInstructions: "Log in op uw account of maak een nieuwe aan",
    signInError: "Er is iets misgegaan bij het inloggen.",
    logout: "Uitloggen",
    helloName: (name) => `Hallo, ${name}!`,
    loading: "Laden...",
    myCollection: "Mijn Collectie",
    wishlist: "Verlanglijst",
    profile: "Profiel",
    profileLoadError: "Kan je profiel niet laden. Probeer het opnieuw.",
    searchAlbumArtist: "Zoek albums of artiesten",
    searchAlbumArtistCatNo: "Zoek albums, artiesten of catalogusnummers",
    addAlbum: "Album toevoegen",
    searchDatabase: "Database doorzoeken",
    remove: "Verwijder",
    viewDetails: "Details",
    addToCollection: "Collectie",
    addToCollectionTitle: "Album toevoegen aan collectie",
    addToWishlist: "Verlanglijst",
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
    cancel: "Annuleren",
    addImage: "Afbeelding toevoegen",
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
