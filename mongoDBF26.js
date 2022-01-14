const fs = require ('fs');
const path = require ('path');
const MongoClient = require ('mongodb').MongoClient;
const { error } = require ("console");

let films;
let segments;
let users;
let videos;
let url = "mongodb://localhost:27017/";
let diz;
let query1 = 'cat "@Valerio Ciriaci" "title:Mister Wonderland"';
let query2 = '"title:Mister Wonderland" "@Valerio Ciriaci" cat';
let query3 = '"title:Mister Wonderland" flag';
let query4 = 'mirror "@Marta Popivoda"';
let query5 = '"nationality:Brasil/Spain" mirror';
let query6 = '"location:Firenze (Toscana, Italia)" tower';
let query7 = '"nationality:Italy" "title:Mister Wonderland" cat';
let query8 = '"title:Mister Wonderland" "@Valerio Ciriaci" "nationality:Italy" cat';
let query9 = '"title:Mister Wonderland" "@Valerio Ciriaci" cat "nationality:Italy" "location:Connecticut; Massachusetts; New Haven; Pennsylvania; Eden Musée (Parigi); Lucca; Toscana;"';
let query10 = '"title:Mister Wonderland"';
let query11 = 'mizin';
let query12 = 'cat "title:Mister Wonderland" "@Valerio Ciriaci"';
let query13 = '"title:Mister Wonderland" cat "location:Connecticut; Massachusetts; New Haven; Pennsylvania; Eden Musée (Parigi); Lucca; Toscana;"';
let query14 = 'cat';
let query15 = 'c';

let ricercaparametro = "";
let ricercapersona = "";
let ricercachiave = "";
let ricercatesto = "";
let queryArray = [];
let queryArrayand = [];
let query;
let queryand;
let setfinale = new Set();

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    films = db.db("prova").collection("Films");
    segments = db.db("prova").collection("Segments");
    users = db.db("prova").collection("Users");
    videos = db.db("prova").collection("Videos");
    diz = {"Films" : films, "Segments" : segments, "Users" : users, "Videos" : videos};
    tagliaquery(query12);
    trova(query, queryand);
  });

function trova(queryoggetto, queryoggetto2) {
  let cercaquery = queryoggetto.$or;
  let cercaqueryand = queryoggetto2.$and;
  let cercatesto = queryoggetto.$text;
  films.find({$and: cercaqueryand}).toArray(async function(err, results){
    if (err) throw err;
    let IDtrovati = [];
    for (let i = 0; i < results.length; i++) {
      IDtrovati.push(results[i].phx_VideoId);
      }
    if (ricercatesto == "") {
        segments.find({VideoId: { $in: IDtrovati }}).limit(6).toArray(async function(err, result){
            if (err) throw err;
            console.log("Risultati AND:");
            console.log(result);
            setfinale.add(result);
        
    })} else {
    segments.find({VideoId: { $in: IDtrovati }, '$text': cercatesto }).toArray(async function(err, result){
    if (err) throw err;
    console.log("Risultati AND:");
    console.log(result);
    setfinale.add(result);

    })
  }
  })

  films.find({$or: cercaquery}).toArray(async function(err, results){
    if (err) throw err;
    let IDtrovati = [];
    for (let i = 0; i < results.length; i++) {
      IDtrovati.push(results[i].phx_VideoId);
      }
    if (ricercatesto == "") {
        segments.find({VideoId: { $in: IDtrovati }}).limit(6).toArray(async function(err, result){
            if (err) throw err;
            console.log("Risultati OR:");
            console.log(result);
            setfinale.add(result);
            console.log("Ecco il setfinale:")
            console.log(setfinale);
        
    })} else {
    segments.find({VideoId: { $in: IDtrovati }, '$text': cercatesto }).toArray(async function(err, result){
    if (err) throw err;
    console.log("Risultati OR:");
    console.log(result);
    setfinale.add(result);
    console.log("Ecco il setfinale:")
    console.log(setfinale);
    
    })
  }
  })
  //setfinale è un set con prima i risultati della query con l'AND a livello superiore e poi i risultati della query con l'OR ma li ripete
};

function tagliaquery(queryoggetto) {
    let spezzaquery = queryoggetto.split('"');
    if (spezzaquery == "") {
        spezzaquery = [queryoggetto];
    }
    console.log(spezzaquery);
    let contatore;
    let contatore2;
    let sondastringa = "";
    let sondastringa2 = "";
    let cercaparametri;
    let cercapersone;
    for (let i = 0; i < spezzaquery.length; i++) {
        contatore = spezzaquery[i].length;
        sondastringa = spezzaquery[i];
        cercaparametri = spezzaquery[i].indexOf(':');
        cercapersone = spezzaquery[i].indexOf('@');
            if (cercapersone >= 0) {
                ricercapersona = spezzaquery[i];
                ricercapersona = ricercapersona.slice(1);
                queryArray.push({ phx_director: ricercapersona }, {Regia: ricercapersona}, {Soggetto: ricercapersona}, 
                                {Montaggio: ricercapersona}, {Antroponimi: ricercapersona}, {Fotografia: ricercapersona}, 
                                {"Musiche/Suono": ricercapersona}, {"Produzione/Distribuzione/Contatto": ricercapersona}, 
                                {Sceneggiatura: ricercapersona} );
                queryArrayand.push({ $or : [
                                   { phx_director: ricercapersona }, {Regia: ricercapersona}, {Soggetto: ricercapersona}, 
                                   {Montaggio: ricercapersona}, {Antroponimi: ricercapersona}, {Fotografia: ricercapersona}, 
                                   {"Musiche/Suono": ricercapersona}, {"Produzione/Distribuzione/Contatto": ricercapersona}, 
                                   {Sceneggiatura: ricercapersona} ] });
                spezzaquery.splice(i,1);

            } else if (cercaparametri >= 0) {
                let spezzacerca = spezzaquery[i].split(":");
                ricercaparametro = spezzacerca[0];
                ricercachiave = spezzacerca[1];
                if (ricercaparametro == "title") {
                    queryArray.push( {phx_title: ricercachiave} );
                    queryArrayand.push({ $or : [ { phx_title: ricercachiave } ] });

                } else if (ricercaparametro == "location") {
                    queryArray.push( {Toponimi: ricercachiave} );
                    queryArrayand.push({ $or : [ { Toponimi: ricercachiave } ] });

                } else if (ricercaparametro == "nationality") {
                    queryArray.push( {phx_country: ricercachiave}, {Nazione: ricercachiave} );
                    queryArrayand.push({ $or : [ {phx_country: ricercachiave}, {Nazione: ricercachiave} ] });

                }
                spezzaquery.splice(i,1);
                
            }
    }
    spezzaquery = spezzaquery.filter(function(str) {
        return /\S/.test(str);
        });
    if ( spezzaquery.length >= 1 ) {
        let testotrovato = spezzaquery[0].trim();
        ricercatesto = testotrovato;
        }
    console.log(spezzaquery);
    //console.log(ricercapersona);
    console.log(queryArray);
    //console.log(ricercaparametro);
    //console.log(ricercachiave);
    console.log( "ecco testo " + ricercatesto);
    //console.log(parametropersona);
    //onsole.log(contaelementi);
    if (ricercatesto == "") {
        query = { $or: queryArray };
        queryand = { $and: queryArrayand };
    } else {
        query = { $or: queryArray, '$text': { '$search': ricercatesto}};
        queryand = { $and: queryArrayand, '$text': { '$search': ricercatesto}};
    }
    if (ricercapersona == "" && ricercaparametro == "") {
        query = { $or: [{}], '$text': { '$search': ricercatesto}};
        queryand = { $and: [{}], '$text': { '$search': ricercatesto}};
    }
    console.log("Query finale: ")
    console.log(query);
    console.log("Query and finale: ")
    console.log(queryand);
}

//nuova versione della DBF25

//cose da migliorare: merging, testuale che agisce anche sui film?

//problema condizione testuale risolto, togliendo il for annidato, testuali funzionano anche con un solo carattere

//aggiunte: query funzionano con la testuale in qualunque posizione, tutte le query funzionano, limite ai risultati aggiunto,
//          vengono svolte due query una con AND a livello superiore e una con OR. Un set restituisce i risultati di entrambe,
//          con prima i risultati della query con AND e poi quelli della query con OR, però li ripete

//indexof (fatto)
//and a livello superiore (fatto)
//limit (fatto)
//merge tra le due query (fatto)

//let s= new Set()
//s.add( ....)