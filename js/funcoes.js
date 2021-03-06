
function substituiHTML( oid, marcador, newText ) {
  // esta função procura o texto do innerHTML de um elemento e substitui do inicio até o marcador com newText
  str = document.getElementById( oid ).innerHTML;
  pos = str.indexOf(marcador); 
  resto = str.length - pos;
  document.getElementById( oid ).innerHTML = newText + '' +  str.substr( pos, resto );
}

function playEscala(nEscala, intervalo, ascendente, loop ) {

  stopPlaying();

  gIntervalo = intervalo;
  nNotaInicial = 0;
  incremento = 1;
  notaFinal =  GAITA.gaitas[GAITA.selected][c_escalas][nEscala][c_notas].length;

  if( ! ascendente ) {
    nNotaInicial = notaFinal-1;
    incremento = -1;
    notaFinal = -1 ;
  } ;

  setNotes(nEscala, nNotaInicial);

  (function doPlay(nNota) {
    gTimeout=setTimeout(function() {
      if (nNota !== notaFinal ) {
        setNotes(nEscala, nNota);
        nNota+=incremento; 
        doPlay(nNota);
      } else {
        if( loop ) {
          doPlay(nNotaInicial);
        } else { 
          clearKeyboard();
        }
      }
    }, gIntervalo);
  })(nNotaInicial+incremento);

}

function setNotes(scale_no, note_no) {

  //destaca notas da escala selecionada e toca o som correspondente
  noteList = GAITA.gaitas[GAITA.selected][c_escalas][scale_no][c_notas][note_no];

  clearKeyboard();

  if (noteList[0] === c_close) {
    markButton = markButtonClose;
  } else {
    markButton = markButtonOpen;
  }

  for (i=0; i < noteList[1].length; i++) {
    markButton(noteList[1][i][0], noteList[1][i][1]);
  }

  document.getElementById( 'scale_' + scale_no + '_' + note_no ).style.setProperty('background-color', 'gray', 'important');
  setModifiedItem( 'scale_' + scale_no + '_' + note_no );
  gLayer.draw();

  if (checkboxAcordeon.checked) playSound(noteList, 0);
  if (checkboxPiano.checked) playSound(noteList, 1);

}

function carregaTabelaEscalas() {
  aScales = GAITA.gaitas[GAITA.selected][c_escalas];

  scale_str = '<tr><td><strong>Escala</strong></td><td><strong>Notas</strong></td></tr>';

  for (var c=0; c < aScales.length; c++) {
	nome = parseNote(aScales[c][c_symbol]);
    scale_str += 
         '<tr><td id="scale_'+ c +'">'+  nome.key + '<i>' + nome.complement + '</i>'
      +  '<br>' 
      +  '<button id="backward_'+ c +'" class="btn btn-warning" title="Escala Descendente" onclick="playEscala('+ c +', '+gIntervalo+', false, true);"><i class="icon-backward icon-white"></i></button>'
      +  '<button id="pause_'+ c +'" class="btn btn-warning" title="Para a execução" onclick="stopPlaying();"><i class="icon-stop icon-white"></i></button>'
      +  '<button id="forward_'+ c +'" class="btn btn-warning" title="Escala Ascendente" onclick="playEscala('+ c +', '+gIntervalo+', true, true);"><i class="icon-forward icon-white"></i></button>'
      +  '&nbsp;'
      +  '<button id="fbackward_'+ c +'" class="btn btn-success" title="Diminui a velocidade" onclick="gIntervalo *= 2;"><i class="icon-minus-sign icon-white"></i></button>'
      +  '<button id="fforward_'+ c +'" class="btn btn-success" title="Aumenta Velocidade" onclick="gIntervalo /= 2;"><i class="icon-plus-sign icon-white"></i></button>'
      +  '</td><td>';
    
    for (var v=0; v < aScales[c][c_notas].length; v++) {
       opening = aScales[c][c_notas][v][0] === c_open;
       aNotes = aScales[c][c_notas][v][1];
       labelNotas = '';
       for( var n=aNotes.length-1; n > 0;  n-- ) {
		 botao = GAITA.keyboard[aNotes[n][0]][aNotes[n][1]];
         labelNotas = '/' + (opening ? botao.notaOpen.key +'<i>'+ botao.notaOpen.complement+'</i>' : botao.notaClose.key+'<i>'+ botao.notaClose.complement+'</i>') + labelNotas;
       }   
       botao = GAITA.keyboard[aNotes[0][0]][aNotes[0][1]];
       labelNotas = (opening ? botao.notaOpen.key +'<i>'+ botao.notaOpen.complement+'</i>' : botao.notaClose.key+'<i>'+ botao.notaClose.complement+'</i>') + labelNotas;
       scale_str += '<button id="scale_'+ c +'_'+ v +'" class="btn btn-';                    
       scale_str += opening ? 'success"' : 'warning"';
       scale_str += ' title="';
       scale_str += opening ? 'Abrindo o fole' : 'Fechando o fole';
       scale_str += '" onmouseover="setNotes(' + c +',' + v + ')" > ' + labelNotas ;
       scale_str += '<br><i class="';
       scale_str += opening ? 'icon-resize-full' : 'icon-resize-small';
       scale_str += ' icon-white"></i>';
       scale_str += " </button> ";
    }

    scale_str += '</td></tr>';

  }
  document.getElementById("scales_table").innerHTML = scale_str;
}
