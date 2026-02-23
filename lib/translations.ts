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
