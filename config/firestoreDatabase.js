// Keep both Nagrik web and Android pointed at the EXISTING Firestore database.
// Firebase database IDs "default" and "(default)" refer to different databases.
// Do not change this without migrating data AND matching database security rules.
export const NAGRIK_FIRESTORE_DATABASE_ID = "default";
