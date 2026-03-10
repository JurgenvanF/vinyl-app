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
    forgotPassword: string;
    enterEmailForReset: string;
    passwordResetEmailSent: string;
    passwordResetEmailFailed: string;
    verifyAccountTitle: string;
    verifyAccountMessage: string;
    accountSecurity: string;
    emailVerified: string;
    emailNotVerified: string;
    sendVerificationEmailAgain: string;
    reloadVerificationStatus: string;
    verificationEmailSent: string;
    verificationEmailFailed: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    updatePassword: string;
    deleteAccount: string;
    deleteAccountWarning: string;
    deleteAccountConfirmPassword: (email: string) => string;
    deleteAccountSuccess: string;
    deleteAccountError: string;
    deleteAccountWrongPassword: string;
    passwordUpdated: string;
    passwordUpdateFailed: string;
    passwordsDoNotMatch: string;
    passwordTooShort: string;
    email: string;
    emailAlreadyInUse: string;
    invalidEmail: string;
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
    name: string;
    privacy: string;
    friends: string;
    editProfile: string;
    saveChanges: string;
    personalInformation: string;
    biography: string;
    avatarColor: string;
    collectionStatsAndFavorites: string;
    albumsInCollection: string;
    yearsCollecting: string;
    uniqueGenres: string;
    topArtist: string;
    yearStartedCollecting: string;
    favoriteAlbum: string;
    favoriteGenres: string;
    noFavoriteAlbumSet: string;
    noGenresSet: string;
    noFavoriteGenresSet: string;
    noneSelected: string;
    privacySettings: string;
    privacyHint: string;
    profileVisibility: string;
    collectionVisibility: string;
    wishlistVisibility: string;
    visibilityEveryone: string;
    visibilityFriends: string;
    visibilityOnlyMe: string;
    visibilityPublic: string;
    visibilityDiscoverable: string;
    visibilityHidden: string;
    profileVisibilityHintEveryone: string;
    profileVisibilityHintFriends: string;
    profileVisibilityHintMe: string;
    save: string;
    saving: string;
    saveFailed: string;
    friendsHint: string;
    searchFriendsPlaceholder: string;
    searching: string;
    search: string;
    searchFailed: string;
    add: string;
    request: string;
    requested: string;
    revokeRequest: string;
    friendRequests: string;
    accept: string;
    reject: string;
    myFriends: string;
    friendCount: (count: string) => string;
    removeFriend: string;
    removeFriendConfirm: string;
    friendProfile: string;
    albumsInCommon: string;
    albumsInCommonCount: (count: number) => string;
    inBothCollections: string;
    notAllowed: string;
    searchAlbumArtist: string;
    searchAlbumArtistCatNo: string;
    searchSpecificSongs: string;
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
    update: string;
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
    currentCover: string;
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
    customEntryEditTitle: string;
    customEntryEditHelp: string;
    customEntryMissingRequired: (fields: string) => string;
    customEntryInvalidNumbers: (fields: string) => string;
    customEntryConfirmTitle: (
      albumTitle: string,
      albumArtist: string,
      target: string,
    ) => string;
    customEntryUpdateConfirmTitle: (
      albumTitle: string,
      albumArtist: string,
    ) => string;
    customEntryConfirmMessage: string;
    customEntryAdded: (albumTitle: string, albumArtist: string) => string;
    customEntryUpdated: (albumTitle: string, albumArtist: string) => string;
    customEntryLoadError: string;
    customEntrySaveError: string;
    edit: string;
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
    addFirstAlbumPrompt: string;
    noAlbumsInCollection: string;
    noAlbumsInTheirCollection: string;
    noAlbumsInWishlist: string;
    noAlbumsInTheirWishlist: string;
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
    friendsHaveThisAlbum: string;
    noFriendsHaveThisAlbum: string;
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
    notFoundBadge: string;
    notFoundTitle: string;
    notFoundDescription: string;
    notFoundAction: string;
    errorBadge: string;
    errorTitle: string;
    errorDescription: string;
    errorRetry: string;
    errorBackHome: string;
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
    forgotPassword: "Forgot password?",
    enterEmailForReset: "Enter your email first so we can send a reset link.",
    passwordResetEmailSent:
      "If an account exists for this email, you'll receive a reset link shortly. Check Spam/Promotions too.",
    passwordResetEmailFailed: "Could not send password reset email.",
    verifyAccountTitle: "Verify your account",
    verifyAccountMessage:
      "Please verify your email via the link we sent you. This page will automatically continue once your email is verified.",
    accountSecurity: "Account security",
    emailVerified: "Email verified.",
    emailNotVerified: "Email not verified yet.",
    sendVerificationEmailAgain: "Send verification email again",
    reloadVerificationStatus: "Reload status",
    verificationEmailSent: "Verification email sent.",
    verificationEmailFailed: "Could not send verification email.",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmNewPassword: "Confirm new password",
    updatePassword: "Update password",
    deleteAccount: "Delete account",
    deleteAccountWarning:
      "This permanently deletes your account and you will lose access to your account and, with it, the collection. This action cannot be undone.",
    deleteAccountConfirmPassword: (email) =>
      `To confirm, enter the password for ${email}.`,
    deleteAccountSuccess: "Account deleted successfully.",
    deleteAccountError: "Could not delete account.",
    deleteAccountWrongPassword: "Incorrect password.",
    passwordUpdated: "Password updated.",
    passwordUpdateFailed: "Could not update password.",
    passwordsDoNotMatch: "New passwords do not match.",
    passwordTooShort: "Password must be at least 8 characters.",
    email: "Email",
    emailAlreadyInUse: "This email address is already in use.",
    invalidEmail: "Please enter a valid email address.",
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
    name: "Name",
    privacy: "Privacy",
    friends: "Friends",
    editProfile: "Edit profile",
    saveChanges: "Save changes",
    personalInformation: "Personal information",
    biography: "Biography",
    avatarColor: "Avatar color",
    collectionStatsAndFavorites: "Collection stats & favorites",
    albumsInCollection: "Albums in collection",
    yearsCollecting: "Years collecting",
    uniqueGenres: "Unique genres",
    topArtist: "Top artist",
    yearStartedCollecting: "Year started collecting",
    favoriteAlbum: "Favorite album",
    favoriteGenres: "Favorite genres",
    noFavoriteAlbumSet: "No favorite album set yet.",
    noGenresSet: "No genres in your collection.",
    noFavoriteGenresSet: "No favorite genres set yet.",
    noneSelected: "None selected",
    privacySettings: "Visibility settings",
    privacyHint: "Changes here are saved immediately.",
    profileVisibility: "Profile visibility",
    collectionVisibility: "Collection visibility",
    wishlistVisibility: "Wishlist visibility",
    visibilityEveryone: "Everyone",
    visibilityFriends: "Only friends",
    visibilityOnlyMe: "Only me",
    visibilityPublic: "Public",
    visibilityDiscoverable: "Discoverable",
    visibilityHidden: "Hidden",
    profileVisibilityHintEveryone:
      "Anyone can find you, send a friend request, and view your profile.",
    profileVisibilityHintFriends:
      "Anyone can send a friend request, but only friends can view your profile.",
    profileVisibilityHintMe:
      "Your account won’t appear in search, and nobody can view your profile.",
    save: "Save",
    saving: "Saving",
    saveFailed: "Could not save your changes. Please try again.",
    friendsHint: "Search by name or email to add friends.",
    searchFriendsPlaceholder: "Type a name or email…",
    searching: "Searching",
    search: "Search",
    searchFailed: "Search failed. Please try again.",
    add: "Add",
    request: "Request",
    requested: "Requested",
    revokeRequest: "Revoke",
    friendRequests: "Friend requests",
    accept: "Accept",
    reject: "Reject",
    myFriends: "My friends",
    friendCount: (count) => `${count} friends`,
    removeFriend: "Remove friend",
    removeFriendConfirm: "Are you sure you want to remove this friend?",
    friendProfile: "Friend profile",
    albumsInCommon: "Albums in common",
    albumsInCommonCount: (count) =>
      `${count} ${count === 1 ? "album" : "albums"} in common`,
    inBothCollections: "In both collections",
    notAllowed: "Not allowed by this user's privacy settings.",
    searchAlbumArtist: "Search albums or artists",
    searchAlbumArtistCatNo: "Search albums, artists or catalog numbers",
    searchSpecificSongs: "Search specific songs",
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
    update: "Update",
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
    currentCover: "Current cover",
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
    notesHelp: "Optional. You can always edit later.",
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
    customEntryEditTitle: "Edit album",
    customEntryEditHelp: "Update the fields below to edit this custom album.",
    customEntryMissingRequired: (fields) =>
      `Missing required fields: ${fields}`,
    customEntryInvalidNumbers: (fields) => `Please use numbers for: ${fields}`,
    customEntryConfirmTitle: (albumTitle, albumArtist, target) =>
      `Add ${albumTitle} by ${albumArtist} to your ${target}?`,
    customEntryUpdateConfirmTitle: (albumTitle, albumArtist) =>
      `Update ${albumTitle} by ${albumArtist}?`,
    customEntryConfirmMessage:
      "Are you sure you want to save this custom album? You can always edit this album.",
    customEntryAdded: (albumTitle, albumArtist) =>
      `Added ${albumTitle} by ${albumArtist}`,
    customEntryUpdated: (albumTitle, albumArtist) =>
      `Updated ${albumTitle} by ${albumArtist}`,
    customEntryLoadError: "Something went wrong loading this custom album.",
    customEntrySaveError: "Something went wrong saving this custom album.",
    edit: "Edit",
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
    addFirstAlbumPrompt: "Add your first album to get started.",
    noAlbumsInCollection: "No albums in your collection yet.",
    noAlbumsInTheirCollection: "No albums in their collection yet.",
    noAlbumsInWishlist: "No albums in your wishlist yet.",
    noAlbumsInTheirWishlist: "No albums in their wishlist yet.",
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
    friendsHaveThisAlbum: "Friends with this album in collection",
    noFriendsHaveThisAlbum: "None",
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
    notFoundBadge: "404 - Lost in the Crates",
    notFoundTitle: "This record is off the shelf",
    notFoundDescription:
      "The page you're trying to open doesn't exist anymore. Maybe it was removed, renamed, or never pressed at all.",
    notFoundAction: "Browse collection",
    errorBadge: "500 - Needle Skipped",
    errorTitle: "The record hit a scratch",
    errorDescription:
      "Something unexpected interrupted playback. Let's try dropping the needle again.",
    errorRetry: "Try again",
    errorBackHome: "Back to Home",
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
    forgotPassword: "Wachtwoord vergeten?",
    enterEmailForReset:
      "Vul eerst je e-mailadres in zodat we een resetlink kunnen sturen.",
    passwordResetEmailSent:
      "Als er een account bestaat voor dit e-mailadres, ontvang je zo een resetlink. Check ook je spam/promoties.",
    passwordResetEmailFailed: "Kon geen e-mail voor wachtwoordreset versturen.",
    verifyAccountTitle: "Verifieer je account",
    verifyAccountMessage:
      "Verifieer je e-mailadres via de link die we je hebben gestuurd. Deze pagina gaat automatisch verder zodra je e-mailadres is geverifieerd.",
    accountSecurity: "Accountbeveiliging",
    emailVerified: "E-mailadres geverifieerd.",
    emailNotVerified: "E-mailadres is nog niet geverifieerd.",
    sendVerificationEmailAgain: "Verificatie-e-mail opnieuw sturen",
    reloadVerificationStatus: "Status vernieuwen",
    verificationEmailSent: "Verificatie-e-mail verzonden.",
    verificationEmailFailed: "Kon geen verificatie-e-mail versturen.",
    currentPassword: "Huidig wachtwoord",
    newPassword: "Nieuw wachtwoord",
    confirmNewPassword: "Bevestig nieuw wachtwoord",
    updatePassword: "Wachtwoord wijzigen",
    deleteAccount: "Account verwijderen",
    deleteAccountWarning:
      "Dit verwijdert je account permanent en je verliest de toegang tot je account en daarmee ook tot de collectie. Deze actie kan niet ongedaan gemaakt worden.",
    deleteAccountConfirmPassword: (email) =>
      `Om te bevestigen, voer het wachtwoord in voor ${email}.`,
    deleteAccountSuccess: "Account succesvol verwijderd.",
    deleteAccountError: "Account verwijderen mislukt.",
    deleteAccountWrongPassword: "Onjuist wachtwoord.",
    passwordUpdated: "Wachtwoord gewijzigd.",
    passwordUpdateFailed: "Kon wachtwoord niet wijzigen.",
    passwordsDoNotMatch: "Nieuwe wachtwoorden komen niet overeen.",
    passwordTooShort: "Wachtwoord moet minimaal 8 tekens zijn.",
    email: "E-mail",
    emailAlreadyInUse: "Dit e-mailadres is al in gebruik.",
    invalidEmail: "Vul een geldig e-mailadres in.",
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
    name: "Naam",
    privacy: "Privacy",
    friends: "Vrienden",
    editProfile: "Profiel bewerken",
    saveChanges: "Wijzigingen opslaan",
    personalInformation: "Persoonlijke informatie",
    biography: "Biografie",
    avatarColor: "Profielfoto kleur",
    collectionStatsAndFavorites: "Collectiestatistieken & favorieten",
    albumsInCollection: "Albums in collectie",
    yearsCollecting: "Jaren verzamelen",
    uniqueGenres: "Unieke genres",
    topArtist: "Top artiest",
    yearStartedCollecting: "Startjaar verzamelen",
    favoriteAlbum: "Favoriete album",
    favoriteGenres: "Favoriete genres",
    noFavoriteAlbumSet: "Nog geen favoriet album ingesteld.",
    noGenresSet: "Nog geen genres in je collectie.",
    noFavoriteGenresSet: "Nog geen favoriete genres ingesteld.",
    noneSelected: "Niets geselecteerd",
    privacySettings: "Zichtbaarheidsinstellingen",
    privacyHint: "Wijzigingen worden direct opgeslagen.",
    profileVisibility: "Profiel zichtbaarheid",
    collectionVisibility: "Collectie zichtbaarheid",
    wishlistVisibility: "Verlanglijst zichtbaarheid",
    visibilityEveryone: "Iedereen",
    visibilityFriends: "Alleen vrienden",
    visibilityOnlyMe: "Alleen ik",
    visibilityPublic: "Openbaar",
    visibilityDiscoverable: "Vindbaar",
    visibilityHidden: "Verborgen",
    profileVisibilityHintEveryone:
      "Iedereen kan je vinden, een vriendschapsverzoek sturen en je profiel bekijken.",
    profileVisibilityHintFriends:
      "Iedereen kan een vriendschapsverzoek sturen, maar alleen vrienden kunnen je profiel bekijken.",
    profileVisibilityHintMe:
      "Je account verschijnt niet in zoekresultaten en niemand kan je profiel bekijken.",
    save: "Opslaan",
    saving: "Opslaan",
    saveFailed: "Kon je wijzigingen niet opslaan. Probeer het opnieuw.",
    friendsHint: "Zoek op naam of e-mail om vrienden toe te voegen.",
    searchFriendsPlaceholder: "Typ een naam of e-mail…",
    searching: "Zoeken",
    search: "Zoeken",
    searchFailed: "Zoeken mislukt. Probeer het opnieuw.",
    add: "Toevoegen",
    request: "Verzoek",
    requested: "Aangevraagd",
    revokeRequest: "Intrekken",
    friendRequests: "Vriendschapsverzoeken",
    accept: "Accepteren",
    reject: "Weigeren",
    myFriends: "Mijn vrienden",
    friendCount: (count) => `${count} vrienden`,
    removeFriend: "Vriend verwijderen",
    removeFriendConfirm: "Weet je zeker dat je deze vriend wilt verwijderen?",
    friendProfile: "Vriendprofiel",
    albumsInCommon: "Albums gemeenschappelijk",
    albumsInCommonCount: (count) =>
      `${count} ${count === 1 ? "album" : "albums"} gemeenschappelijk`,
    inBothCollections: "In beide collecties",
    notAllowed:
      "Niet toegestaan door de privacy-instellingen van deze gebruiker.",
    searchAlbumArtist: "Zoek albums of artiesten",
    searchAlbumArtistCatNo: "Zoek albums, artiesten of catalogusnummers",
    searchSpecificSongs: "Zoek specifieke nummers",
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
    update: "Bijwerken",
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
    currentCover: "Huidige omslag",
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
    customEntryEditTitle: "Album bewerken",
    customEntryEditHelp:
      "Werk de velden hieronder bij om dit handmatige album te bewerken.",
    customEntryMissingRequired: (fields) =>
      `Verplichte velden ontbreken: ${fields}`,
    customEntryInvalidNumbers: (fields) => `Gebruik cijfers voor: ${fields}`,
    customEntryConfirmTitle: (albumTitle, albumArtist, target) =>
      `Voeg ${albumTitle} van ${albumArtist} toe aan je ${target}?`,
    customEntryUpdateConfirmTitle: (albumTitle, albumArtist) =>
      `Werk ${albumTitle} van ${albumArtist} bij?`,
    customEntryConfirmMessage:
      "Weet je zeker dat je dit handmatige album wilt opslaan? Je kunt dit album altijd wijzigen.",
    customEntryAdded: (albumTitle, albumArtist) =>
      `${albumTitle} van ${albumArtist} toegevoegd`,
    customEntryUpdated: (albumTitle, albumArtist) =>
      `${albumTitle} van ${albumArtist} bijgewerkt`,
    customEntryLoadError:
      "Er is iets misgegaan bij het laden van dit handmatige album.",
    customEntrySaveError:
      "Er is iets misgegaan bij het opslaan van dit handmatige album.",
    edit: "Bewerken",
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
    addFirstAlbumPrompt: "Voeg je eerste album toe om te beginnen.",
    noAlbumsInCollection: "Nog geen albums in je collectie.",
    noAlbumsInTheirCollection: "Nog geen albums in hun collectie.",
    noAlbumsInWishlist: "Nog geen albums in je verlanglijst.",
    noAlbumsInTheirWishlist: "Nog geen albums in hun verlanglijst.",
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
    friendsHaveThisAlbum: "Vrienden met dit album in collectie",
    noFriendsHaveThisAlbum: "Geen",
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
    notFoundBadge: "404 - Verdwaald tussen de platen",
    notFoundTitle: "Deze plaat staat niet in de kast",
    notFoundDescription:
      "De pagina die je probeert te openen bestaat niet meer. Misschien is die verwijderd, hernoemd of nooit uitgebracht.",
    notFoundAction: "Bekijk collectie",
    errorBadge: "500 - Naald sloeg over",
    errorTitle: "Deze plaat heeft een kras",
    errorDescription:
      "Er ging iets onverwachts mis. Probeer de naald nog eens opnieuw te laten zakken.",
    errorRetry: "Probeer opnieuw",
    errorBackHome: "Terug naar home",
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
