import bcrypt from "bcrypt";

//bcrypt.hash("Samuel2004", 10).then(console.log);
//bcrypt.hash("YoannYamdM2", 10).then(console.log);
//import bcrypt from "bcrypt";

const motDePasse = "votre_mot_de_passe_test";
const hash = "2b$10$EfQWRoam1v99K9ytzAhbR.9X4haaxVK.poMkcbc9uK5KFB4/7k41S";

const estValide = await bcrypt.compare(motDePasse, hash);
console.log("Mot de passe valide ?", estValide);
