App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) 
    {
         App.web3Provider = window.ethereum;
         try 
         {
            // Request account access
            await window.ethereum.enable();
         }
         catch (error) 
         {
            // User denied account access...
            console.error("User denied account access")
         }
    }
    // Legacy dapp browsers...
    else if (window.web3) 
    {
        App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else
    {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
   
    $.getJSON('Adoption.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var AdoptionArtifact = data;
        App.contracts.Adoption = TruffleContract(AdoptionArtifact);

        // Set the provider for our contract
        App.contracts.Adoption.setProvider(App.web3Provider);

        // Use our contract to retrieve and mark the adopted pets
        return App.markAdopted();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-submit', App.submit);
    $(document).on('click', '.btn-get', App.getCertificate);
    
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;
    App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
            for (i = 0; i < adopters.length; i++) {
                if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
                $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
            }
        }
    }).catch(function(err) {
        console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();
    var id = parseInt($(event.target).data('id'));
    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
        console.log(error);
    }

    var account = accounts[0];

    App.contracts.Adoption.deployed().then(function(instance) {
    adoptionInstance = instance;

    // Execute adopt as a transaction by sending account
    return adoptionInstance.adopt(id, {from: account});
    }).then(function(result) {
    return App.markAdopted();
    }).catch(function(err) {
    console.log(err.message);
    });
    });
  },

  getCertificate: function(event){

   event.preventDefault();
    var adoptionInstance;

       web3.eth.getAccounts(function(error, accounts) {
    if (error) {
        console.log(error);
    }

    var account = accounts[0];

    App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
        return adoptionInstance.getCertificate.call();
    }).then(function(data){
        if(data != null){
           var result = data;
           if (!error) {
                $("#instructor").html('Student Name : ' + result[0] + '<br>' + 'Certification Name : ' + result[1] + '<br>' + ' Year of Submission : ' + result[2]
                    + '<br><br>Transaction Releated Details <br>' +
                    '<table><tr><th>Coinbase</th><th>Timestamp (UNIX)</th><th>Message Data</th><th>Message Sender</th><th>Transactin Origin</th></tr>' +
                    '<tr><td>' + result[3] + '</td><td>' + result[4] + '</td><td>' + result[5] + '</table>' 
                    //'</td><td>' + result[6] + '</td><td>' + result[7] + '</td></tr
                    );
                console.log("result:"+result);
            }
           }
    }).catch(function(error){
    console.log(error.message);
    });
  });
  
  },


  saveCertificate: function(userName,certName,certDate){
  userName = "Sindhu";
  certName = "Btech in AI";
  certDate = new Date();
  var dd = String(certDate.getDate()).padStart(2, '0');
  var mm = String(certDate.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = certDate.getFullYear();
  certDate = mm + '/' + dd + '/' + yyyy;

   
   var adoptionInstance;

   web3.eth.getAccounts(function(error, accounts) {
   if (error) {
        console.log(error);
    }

    var account = accounts[0];

    App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
        adoptionInstance.saveCertificate(userName, certName, certDate)        
        }).then(function(){
            console.log("certificate added!!!");
        })
        .catch(function(error){
            console.log(error.message);
        });
  });

},


  submit:function(event){
  
   event.preventDefault();
    userName = "Sindhu";
    certName = "Btech in AI";
    certDate = new Date();
    var dd = String(certDate.getDate()).padStart(2, '0');
    var mm = String(certDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = certDate.getFullYear();
    certDate = mm + '/' + dd + '/' + yyyy;
    App.saveCertificate(userName,certName,certDate);
  },

}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
