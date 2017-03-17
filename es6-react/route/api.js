var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var Character = require('./models/character');

/**
 * POST /api/characters
 * Adds new character to the database.
 */
app.post('/api/characters',function (req,res,next) {
    var gender = req.body.gender;
    var characterName = req.body.name;
    var characterIdLookupUrl = 'https://api.eveonline.com/eve/CharacterID.xml.aspx?names=' + characterName;
    var parser = new xml2js.Parser();

    async.waterfall([
        function (callback) {
            request.get(characterIdLookupUrl,function (err,request,xml) {
                if(err) return next(err);

                try{
                    var characterId = parsedXml.eveapi.result[0].rowset[0].row[0].$.characterID;

                    Character.findOne({characterId: characterId},function (err,character) {
                        if(err) return next(err);

                        if(character){
                            return res.status(409).send({ message: character.name + ' 数据库已存在此角色.' });
                        }

                        callback(err,characterId); // 传给下一个函数
                    });
                }
                
            })
        }
    ])

})