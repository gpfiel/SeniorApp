//Aplicação Senior.js
var seniorApp = {
    //Configurações
    settings: {
        ajaxInfoTempo              : "http://developers.agenciaideias.com.br/tempo/json/" // Ex: blumenau-SC
    },

    //Ajusta o HTML para atualizar as informações quando solicitar previsão de outra cidade
    bindGetWeatherInfo :  function () {
        $("#pesquisa").click(function(){

            //Verifica se foi preenchedio a cidade do form
            if ($("#cidade").val() == "") {
              $(".erro-cidade").fadeIn().delay(5000).fadeOut();
              return false;
            }
            seniorApp.showLoading();
            $.post( seniorApp.settings.ajaxInfoTempo + $("#cidade").val() + "-" + $("#estado").val() , function( data ) {
               $(".sol").hide();
               $(".chuva").hide();
                var maiorTemperatura = { dia : null, temperatura : null };
                var menorTemperatura = { dia : null, temperatura : 100 };

                //Atualiza as informações do dia atual
                $(".cidade-atual").html($("#cidade").val() + "-" + $("#estado").val());
                $(".dia-atual").html(data.agora.data_hora);
                $(".desc-atual").html(data.agora.descricao);
                $(".temperatura-atual").html(data.agora.temperatura + "º");
                $(".temperatura-minima-atual").html(data.previsoes[0].temperatura_min + "º");
                $(".temperatura-maxima-atual").html(data.previsoes[0].temperatura_max + "º");
                $(".imagem-atual").attr({"src" : data.agora.imagem, "title" : data.agora.descricao});

                //Guarda dados do gráfico de temperatura
                var chart_labels = [];
                var chart_min = [];
                var chart_max = [];

                $.each( data.previsoes , function( key, dado ) {

                  //Guarda dados do gráfico de temperatura
                  chart_labels.push(dado.data);
                  chart_min.push(dado.temperatura_min);
                  chart_max.push(dado.temperatura_max);

                  //Ajusta as informações de temperatura de todos os dias
                  if (key != 0) {
                      $(".cx-dia-" + key).html(dado.data);
                      $(".box-holder-" + key).find(".desc-atual").html(dado.descricao);
                      $(".box-holder-" + key).find(".imagem-atual").attr({"src" : dado.imagem, "title" : dado.descricao});
                      $(".box-holder-" + key).find(".temperatura-minima-atual").html(dado.temperatura_min + "º");
                      $(".box-holder-" + key).find(".temperatura-maxima-atual").html(dado.temperatura_max + "º");
                  }

                  //Verifica se no dia seguinte o clima estará favorável ao sol ou chuva
                  if (key == 1) {
                    var temp = (parseInt(dado.temperatura_max) + parseInt(dado.temperatura_min) ) / 2;

                    if (temp >= 25 && (dado.descricao == "Tempo Bom (dia)") || dado.descricao == "Ensolarado") {
                      $(".sol").find("img").attr("src", dado.imagem);
                      $(".sol").show();
                    } else {
                      $(".chuva").find("img").attr("src", dado.imagem);
                      $(".chuva").show();
                    }
                  }

                  //Guarda as informações da menor e maior temperatura do período
                  if (maiorTemperatura.temperatura < dado.temperatura_max) {
                    maiorTemperatura.temperatura = dado.temperatura_max;
                    maiorTemperatura.dia = dado.data;
                  }

                  if (dado.temperatura_min < menorTemperatura.temperatura ) {
                    menorTemperatura.temperatura = dado.temperatura_min;
                    menorTemperatura.dia = dado.data;
                  } 
                });
                
                $(".temperatura-minima-periodo").html(menorTemperatura.temperatura + "º - " + menorTemperatura.dia);
                $(".temperatura-maxima-periodo").html(maiorTemperatura.temperatura + "º - " + maiorTemperatura.dia);


                //Inicia o gráfico de temperatura
                new Chartist.Line('.ct-chart', {
                  labels: chart_labels,
                  series: [chart_min, chart_max]
                }, {
                  fullWidth: true,
                  chartPadding: {
                    right: 40
                  }
                });


                seniorApp.hideLoading();
                
            });
        });
    },

    showLoading: function(){ $('.backdrop').show(); },
    hideLoading: function(){ $('.backdrop').fadeOut(); }

};

$(document).ready(function () {  
    //Adiciona ação do botão pesquisar 
    seniorApp.bindGetWeatherInfo();

    //Incia a captura para o elemento cidade e estado
    new dgCidadesEstados({
        cidade: document.getElementById('cidade'),
        estado: document.getElementById('estado'),
        estadoVal: 'SC',
        cidadeVal: 'Blumenau'
    })

    //Carrega as primeiras informações da APi
    $("#pesquisa").click();

});
