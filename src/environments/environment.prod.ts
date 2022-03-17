
export const environment = {
  production: true,
  BASEURL: 'https://api.alumnimatch.co/',
  GOOGLEMAP_APIKEY: 'AIzaSyCv9AobG90T2aGkr4gZxwmUTAv0vELqnOA',
  STRIPE_APIKEY: 'pk_live_51HZKL0KiR0tw86RI2Ev0IqjOmtFXb24mXbKUtNuzTNY042xH9Hg6VcCKa4zPD5xWHqDtwILEomTzhdB84wZ9nvRC00naX1I93N',
  firebaseConfig: {
    apiKey: "AIzaSyBUgjyTfk6S07XAYZkVer8Us4fhnf_h5RA",
    authDomain: "alumnimatch-f290c.firebaseapp.com",
    databaseURL: "https://alumnimatch-f290c.firebaseio.com",
    projectId: "alumnimatch-f290c",
    storageBucket: "alumnimatch-f290c.appspot.com",
    messagingSenderId: "56173969666",
    appId: "1:56173969666:web:61c5b8c969bd25cf76021b",
    measurementId: "G-D0DKPB17ZT"
  },
  JAVA_HOME: "/usr/lib/jvm/java-11-openjdk-amd64",
  version: require('../../package.json').version
};

/* firebase.initializeApp(environment.firebaseConfig); */