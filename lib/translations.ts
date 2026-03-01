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
    customEntryHelp: string;
    required: string;
    optionalDetails: string;
    preview: string;
    saveTo: string;
    saveToCollection: string;
    saveToWishlist: string;
    select: string;
    releaseType: string;
    year: string;
    styles: string;
    formats: string;
    coverImages: string;
    coverImagesHint: string;
    takePhoto: string;
    noImageSelected: string;
    coverSelected: string;
    coverRequired: string;
    addArtist: string;
    artistAdditional: string;
    artistsHelp: string;
    releasedPlaceholder: string;
    releasedInvalid: string;
    primary: string;
    set: string;
    addValue: string;
    yearOnly: string;
    yearMonth: string;
    fullDate: string;
    releasedHelp: string;
    countryHelp: string;
    seriesPlaceholder: string;
    seriesHelp: string;
    notesPlaceholder: string;
    notesHelp: string;
    genreHelp: string;
    mainGenre: string;
    otherGenres: string;
    stylesHelp: string;
    formatsHelp: string;
    images: string;
    addImages: string;
    label: string;
    addLabel: string;
    addExtraArtist: string;
    side: string;
    addSide: string;
    tracklistContinuous: string;
    tracklistSides: string;
    role: string;
    customEntryCommaSeparated: string;
    customEntryText: string;
    customEntryOptional: string;
    customEntryAlternative: string;
    customEntryPreviewCard: string;
    customEntryPreviewHint: string;
    customEntryMissingRequired: (fields: string) => string;
    customEntryInvalidNumbers: (fields: string) => string;
    customEntryConfirmTitle: (
      albumTitle: string,
      albumArtist: string,
      target: string,
    ) => string;
    customEntryConfirmMessage: string;
    customEntryAdded: (albumTitle: string, albumArtist: string) => string;
    customEntrySaveError: string;
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
    unknownValue: string;
    noResult: string;
    albumDetailsReleased: string;
    albumDetailsCountry: string;
    albumDetailsCatalog: string;
    albumDetailsFormatQty: string;
    albumDetailsHave: string;
    albumDetailsWant: string;
    albumDetailsSeries: string;
    albumDetailsSongs: string;
    albumDetailsTotalDuration: string;
    albumDetailsVinylRecords: string;
    albumDetailsLabels: string;
    albumDetailsNoCatNo: string;
    albumDetailsRating: string;
    albumDetailsRatingsCount: (count: number) => string;
    albumDetailsTracklist: string;
    albumDetailsArtists: string;
    albumDetailsExtraArtists: string;
    albumDetailsNotes: string;
    albumDetailsTracks: string;
    albumDetailsOtherTracks: string;
    albumDetailsSide: (side: string) => string;
    albumDetailsImageAria: (index: number) => string;
    barcode: string;
    readyToScan: string;
    clickBelowToStartCamera: string;
    startScanner: string;
    stopScanner: string;
    barcodeErrorNoAlbumFound: string;
    barcodeErrorAutoplayBlocked: string;
    barcodeErrorPreviewMountFailed: string;
    barcodeErrorCameraDenied: string;
    barcodeErrorFetchAlbumData: string;
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
      "Can't find your album? Type # before the catalog number to search it directly, scan the barcode, or add it manually.",
    scanBarcode: "Scan Barcode",
    scanBarcodeInstruction:
      "Click the button below to activate your camera and scan a barcode",
    activateCamera: "Activate Camera",
    customEntry: "Custom Entry",
    customEntryHelp:
      "Add an album manually when it can't be found in search or barcode results.",
    required: "Required",
    optionalDetails: "Optional details",
    preview: "Preview",
    saveTo: "Save to",
    saveToCollection: "Add to collection",
    saveToWishlist: "Add to wishlist",
    select: "Select",
    releaseType: "Release type",
    year: "Year",
    styles: "Styles",
    formats: "Formats",
    coverImages: "Cover images",
    coverImagesHint: "Upload one cover image.",
    takePhoto: "Take photo",
    noImageSelected: "No image selected",
    coverSelected: "Cover selected",
    coverRequired: "Cover image is required",
    addArtist: "Add artist",
    artistAdditional: "Additional artist",
    artistsHelp: "Add all main artists. The first artist is used for sorting.",
    releasedPlaceholder: "DD-MM-YYYY, MM-YYYY or YYYY",
    releasedInvalid: "Release date must be DD-MM-YYYY, MM-YYYY, or YYYY.",
    primary: "Primary",
    set: "Set",
    addValue: "Add",
    yearOnly: "Year",
    yearMonth: "Year & month",
    fullDate: "Full date",
    releasedHelp:
      "Enter DD-MM-YYYY, MM-YYYY, or YYYY. Use the calendar button for a full date.",
    countryHelp: "Select the release country.",
    seriesPlaceholder: "e.g. 'Now That's What I Call Music!'",
    seriesHelp: "Only fill this in if the album is part of a series.",
    notesPlaceholder: "Notes about this release (pressing, edition, etc.)",
    notesHelp: "Optional. Keep it short; you can always edit later.",
    genreHelp: "Top-level genre(s), e.g. Rock, Jazz.",
    mainGenre: "Main genre",
    otherGenres: "Other genres",
    stylesHelp: "More specific style(s), e.g. Indie Rock, Hard Bop.",
    formatsHelp: 'Physical format tags, e.g. Vinyl, LP, 12".',
    images: "Images",
    addImages: "Add images",
    label: "Label",
    addLabel: "Add label",
    addExtraArtist: "Add extra artist",
    side: "Side",
    addSide: "Add side",
    tracklistContinuous: "All",
    tracklistSides: "Sides",
    role: "Role",
    customEntryCommaSeparated: "Comma-separated, e.g. Rock, Pop",
    customEntryText: "Extra text",
    customEntryOptional: "Optional",
    customEntryAlternative: "Alternative",
    customEntryPreviewCard: "Album card preview",
    customEntryPreviewHint:
      "This updates live so you can see what will show in your collection/wishlist.",
    customEntryMissingRequired: (fields) =>
      `Missing required fields: ${fields}`,
    customEntryInvalidNumbers: (fields) => `Please use numbers for: ${fields}`,
    customEntryConfirmTitle: (albumTitle, albumArtist, target) =>
      `Add ${albumTitle} by ${albumArtist} to ${target}?`,
    customEntryConfirmMessage:
      "Are you sure you want to save this custom album?",
    customEntryAdded: (albumTitle, albumArtist) =>
      `Added ${albumTitle} by ${albumArtist}`,
    customEntrySaveError: "Something went wrong saving this custom album.",
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
    unknownValue: "Unknown",
    noResult: "No results found",
    albumDetailsReleased: "Released",
    albumDetailsCountry: "Country",
    albumDetailsCatalog: "Catalog",
    albumDetailsFormatQty: "Format qty",
    albumDetailsHave: "Have",
    albumDetailsWant: "Want",
    albumDetailsSeries: "Series",
    albumDetailsSongs: "Songs",
    albumDetailsTotalDuration: "Total duration",
    albumDetailsVinylRecords: "Vinyl records",
    albumDetailsLabels: "Labels",
    albumDetailsNoCatNo: "No cat#",
    albumDetailsRating: "Rating",
    albumDetailsRatingsCount: (count) => `${count} ratings`,
    albumDetailsTracklist: "Tracklist",
    albumDetailsArtists: "Artists",
    albumDetailsExtraArtists: "Extra Artists",
    albumDetailsNotes: "Notes",
    albumDetailsTracks: "Tracks",
    albumDetailsOtherTracks: "Other tracks",
    albumDetailsSide: (side) => `Side ${side}`,
    albumDetailsImageAria: (index) => `Show image ${index}`,
    barcode: "Barcode",
    readyToScan: "Ready to scan",
    clickBelowToStartCamera: "Click the button below to start the camera",
    startScanner: "Activate Camera",
    stopScanner: "Stop Camera",
    barcodeErrorNoAlbumFound:
      "No album found for this barcode in the database.",
    barcodeErrorAutoplayBlocked:
      "Browser blocked camera autoplay. Tap Start again.",
    barcodeErrorPreviewMountFailed: "Camera preview failed to mount.",
    barcodeErrorCameraDenied: "Camera access denied or unavailable.",
    barcodeErrorFetchAlbumData: "Error fetching album data.",
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
    moveToCollection: (albumTitle) => `Verplaats ${albumTitle} naar collectie`,
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
      "Kun je je album niet vinden? Typ # voor het catalogusnummer om er direct naar te zoeken, scan de barcode, of voeg het handmatig toe.",
    scanBarcode: "Barcode scannen",
    scanBarcodeInstruction:
      "Klik op de knop hieronder om je camera te activeren en een barcode te scannen",
    activateCamera: "Camera activeren",
    customEntry: "Handmatige invoer",
    customEntryHelp:
      "Voeg een album handmatig toe als het niet gevonden kan worden via zoeken of barcode.",
    required: "Verplicht",
    optionalDetails: "Optionele details",
    preview: "Voorbeeld",
    saveTo: "Opslaan in",
    saveToCollection: "Toevoegen aan collectie",
    saveToWishlist: "Toevoegen aan verlanglijst",
    select: "Kies",
    releaseType: "Release type",
    year: "Jaar",
    styles: "Stijlen",
    formats: "Formats",
    coverImages: "Omslagafbeeldingen",
    coverImagesHint: "Upload één cover afbeelding.",
    takePhoto: "Foto maken",
    noImageSelected: "Geen afbeelding gekozen",
    coverSelected: "Omslag gekozen",
    coverRequired: "Omslagafbeelding is verplicht",
    addArtist: "Artiest toevoegen",
    artistAdditional: "Extra artiest",
    artistsHelp:
      "Voeg alle hoofdartiesten toe. De eerste artiest wordt gebruikt voor sortering.",
    releasedPlaceholder: "DD-MM-JJJJ, MM-JJJJ of JJJJ",
    releasedInvalid: "Releasedatum moet DD-MM-JJJJ, MM-JJJJ of JJJJ zijn.",
    primary: "Primair",
    set: "Zet",
    addValue: "Toevoegen",
    yearOnly: "Jaar",
    yearMonth: "Jaar & maand",
    fullDate: "Volledige datum",
    releasedHelp:
      "Vul DD-MM-JJJJ, MM-JJJJ of JJJJ in. Gebruik de kalenderknop voor een volledige datum.",
    countryHelp: "Selecteer het land van deze release.",
    seriesPlaceholder: "bijv. 'Now That's What I Call Music!'",
    seriesHelp: "Vul dit alleen in als het album onderdeel is van een serie.",
    notesPlaceholder: "Notities over deze release (persing, editie, etc.)",
    notesHelp: "Optioneel. Je kunt dit later aanpassen.",
    genreHelp: "Hoofdgenre(s), bijv. Rock, Jazz.",
    mainGenre: "Hoofdgenre",
    otherGenres: "Overige genres",
    stylesHelp: "Meer specifieke stijl(en), bijv. Indie Rock, Hard Bop.",
    formatsHelp: 'Fysieke format-tags, bijv. Vinyl, LP, 12".',
    images: "Afbeeldingen",
    addImages: "Afbeeldingen toevoegen",
    label: "Label",
    addLabel: "Label toevoegen",
    addExtraArtist: "Extra artiest toevoegen",
    side: "Kant",
    addSide: "Kant toevoegen",
    tracklistContinuous: "Alles",
    tracklistSides: "Kanten",
    role: "Rol",
    customEntryCommaSeparated: "Gescheiden door komma's, bv. Rock, Pop",
    customEntryText: "Extra tekst",
    customEntryOptional: "Optioneel",
    customEntryAlternative: "Alternatief",
    customEntryPreviewCard: "Voorbeeld albumkaart",
    customEntryPreviewHint:
      "Dit wordt direct bijgewerkt zodat je ziet wat er straks in je collectie/verlanglijst staat.",
    customEntryMissingRequired: (fields) =>
      `Verplichte velden ontbreken: ${fields}`,
    customEntryInvalidNumbers: (fields) => `Gebruik cijfers voor: ${fields}`,
    customEntryConfirmTitle: (albumTitle, albumArtist, target) =>
      `Voeg ${albumTitle} van ${albumArtist} toe aan ${target}?`,
    customEntryConfirmMessage:
      "Weet je zeker dat je dit handmatige album wilt opslaan?",
    customEntryAdded: (albumTitle, albumArtist) =>
      `${albumTitle} van ${albumArtist} toegevoegd`,
    customEntrySaveError:
      "Er is iets misgegaan bij het opslaan van dit handmatige album.",
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
    unknownValue: "Onbekend",
    noResult: "Geen resultaten gevonden",
    albumDetailsReleased: "Uitgebracht",
    albumDetailsCountry: "Land",
    albumDetailsCatalog: "Catalogus",
    albumDetailsFormatQty: "Format aantal",
    albumDetailsHave: "Heb",
    albumDetailsWant: "Wil",
    albumDetailsSeries: "Serie",
    albumDetailsSongs: "Nummers",
    albumDetailsTotalDuration: "Totale duur",
    albumDetailsVinylRecords: "Vinylplaten",
    albumDetailsLabels: "Labels",
    albumDetailsNoCatNo: "Geen cat#",
    albumDetailsRating: "Beoordeling",
    albumDetailsRatingsCount: (count) => `${count} beoordelingen`,
    albumDetailsTracklist: "Tracklijst",
    albumDetailsArtists: "Artiesten",
    albumDetailsExtraArtists: "Extra artiesten",
    albumDetailsNotes: "Notities",
    albumDetailsTracks: "Nummers",
    albumDetailsOtherTracks: "Overige nummers",
    albumDetailsSide: (side) => `Kant ${side}`,
    albumDetailsImageAria: (index) => `Toon afbeelding ${index}`,
    barcode: "Barcode",
    readyToScan: "Klaar om te scannen",
    clickBelowToStartCamera:
      "Klik op de onderstaande knop om de camera te starten",
    startScanner: "Activeer Camera",
    stopScanner: "Stop Camera",
    barcodeErrorNoAlbumFound:
      "Geen album gevonden voor deze barcode in de database.",
    barcodeErrorAutoplayBlocked:
      "Je browser blokkeerde het automatisch starten van de camera. Tik opnieuw op Start.",
    barcodeErrorPreviewMountFailed: "Cameraweergave kon niet worden geladen.",
    barcodeErrorCameraDenied:
      "Geen toegang tot camera of camera niet beschikbaar.",
    barcodeErrorFetchAlbumData: "Fout bij het ophalen van albumgegevens.",
  },
};

export const t = (
  locale: Locale,
  key: keyof Translations["en"],
  ...args: unknown[]
): string => {
  const value = translations[locale][key];
  if (typeof value === "function")
    return (value as (...args: unknown[]) => string)(...args);
  return value;
};
