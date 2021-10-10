const Sauce = require('../models/Thing');
const fs = require('fs');


exports.createSauce = (req, res, next) => {
  console.log(req.body.sauce);
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: [],
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //req.protocol: http ou https et req.get('host') ici localhost:3000
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  };

//modifier une sauce existante
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
  //soit on change l'image si une nouvelle est fournie soit on modifie juste le corps de la requête
    { 
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  //premier argument indique quel sauce on veut modifier et le deuxième récupère les infos du body pour les attribuer au même id
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id})
  .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
  .catch(error => res.status(400).json({ error }));
};

//afficher une sauce en particulier
exports.findOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
}; 

//supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
  .then( sauce => {
    //on split le chemin de l'image pour récupérer le nom du fichier dans le dossier image
    const filename = sauce.imageUrl.split('/images/')[1];
    //supprimer le fichier ayant ce filename
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
      .catch(error => res.status(400).json({ error }));
    })
  })
  .catch(error => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({error}));
  }; 

  exports.evaluateSauce = (req, res, next) => {

    if( req.body.like === 0 ){
      Sauce.findOne({ _id: req.params.id})
      .then((sauce) => {
        //si l'utilisateur a déjà like la sauce, on enlève le like et on l'enlève des usersLiked
        if(sauce.usersLiked.find(user => user === req.body.userId)){
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: req.body.userId }
            }
          )
          .then(() => { res.status(201).json({ message: "Evaluation prise en compte!" })})
          .catch(error => { res.status(400).json({ error })
          });
        }
        //si l'utilisateur a déjà dislike la sauce, on enlève le dislike et on l'enlève des usersDisLiked
        if(sauce.usersDisliked.find(user => user === req.body.userId)){
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId }
            }
          )
          .then(() => { res.status(201).json({ message: "Evaluation prise en compte!" })})
          .catch(error => { res.status(400).json({ error })
          });
        }
      })
      .catch((error) => {res.status(400).json({ error })});
    }
    //si l'utilisateur n'a pas déjà like la sauce, on rajoute le like et on l'ajoute aux usersLiked
    if( req.body.like === 1 ){
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
          $push: { usersLiked: req.body.userId }
        }
      )
      .then(() => { res.status(201).json({ message: "Evaluation prise en compte!" })})
      .catch(error => { res.status(400).json({ error })
      });
    }
    //si l'utilisateur n'a pas déjà dislike la sauce, on rajoute le like et on l'ajoute aux usersdisLiked
    if( req.body.like === -1 ){
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: 1 },
          $push: { usersDisliked: req.body.userId }
        }
      )
      .then(() => { res.status(201).json({ message: "Evaluation prise en compte!" })})
      .catch(error => { res.status(400).json({ error })
      });
    }
  }
