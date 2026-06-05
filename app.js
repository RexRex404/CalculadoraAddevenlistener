
const visor = document.getElementById('resultado');

const OPERADORES = ['+', '−', '×', '÷', '%'];


function prepararExpresion(expr) {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');
}

/** El valor actual del visor */
function valorActual() {
  return visor.value;
}

function escribir(valor) {
  visor.value = valor;
}

function flashVisor(tipo) {
  // tipo: 'resultado-ok' | 'resultado-err'
  visor.classList.remove('resultado-ok', 'resultado-err');
  // Forzar reflow para reiniciar la animación
  void visor.offsetWidth;
  visor.classList.add(tipo);
  setTimeout(() => visor.classList.remove(tipo), 400);
}


/** Agrega un dígito o el punto decimal */
function agregarNumero(digito) {
  const actual = valorActual();

  // Si el visor solo muestra "0" y se presiona un número distinto → reemplazar
  if (actual === '0' && digito !== '.') {
    escribir(digito);
    return;
  }

  // Si el visor solo muestra "0" y se presiona "." → "0."
  if (actual === '0' && digito === '.') {
    escribir('0.');
    return;
  }

  // No permitir más de un punto en el segmento numérico actual
  // (segmento = la parte después del último operador)
  if (digito === '.') {
    // Separar por operadores para obtener el último número escrito
    const segmentos = actual.split(/[\+\−\×\÷]/);
    const ultimo = segmentos[segmentos.length - 1];
    if (ultimo.includes('.')) return; // Ya tiene punto → ignorar
  }

  escribir(actual + digito);
}

/** Agrega un operador (+, −, ×, ÷) */
function agregarOperador(op) {
  const actual = valorActual();

  // No permitir operador como primer carácter
  if (actual === '0' || actual === '') {
    alert('El formato usado no es válido!');
    return;
  }

  // Si el último carácter ya es un operador → reemplazarlo
  const ultimo = actual[actual.length - 1];
  if (OPERADORES.includes(ultimo)) {
    // value.slice(): quita el último carácter antes de agregar el nuevo
    escribir(actual.slice(0, -1) + op);
    return;
  }

  escribir(actual + op);
}

/** Calcula el porcentaje: divide el número actual entre 100 */
function calcularPorcentaje() {
  try {
    const expr = prepararExpresion(valorActual());
    const resultado = eval(expr) / 100;          // eval() evalúa la expresión
    escribir(String(resultado));
  } catch {
    escribir('Error');
    flashVisor('resultado-err');
  }
}

function borrarUltimo() {
  const actual = valorActual();
  if (actual.length <= 1) {
  
    escribir('0');
    return;
  }
  // value.slice(): devuelve el string sin el último carácter
  escribir(actual.slice(0, -1));
}

/** Limpia todo (C) */
function limpiar() {
  escribir('0');
}

/** Evalúa la expresión (=) */
function evaluar() {
  const expresionVisual = valorActual();

  try {
    // Convertir símbolos a operadores JS
    const expr = prepararExpresion(expresionVisual);

    // Detectar división por cero antes de evaluar
    if (/\/\s*0(?!\.)/.test(expr)) {
      throw new Error('División por cero');   // throw new Error personalizado
    }

    // eval() interpreta la cadena como expresión JavaScript
    const resultado = eval(expr);

    if (resultado === undefined || resultado === null || isNaN(resultado)) {
      throw new Error('Resultado inválido');
    }

    // Redondear para evitar flotantes largos (ej. 0.1+0.2)
    const redondeado = parseFloat(resultado.toPrecision(12));

    flashVisor('resultado-ok');
    escribir(String(redondeado));

    // Restablecer a 0 después de 3 segundos
    setTimeout(() => escribir('0'), 3000);

  } catch (error) {
    // try-catch: captura tanto errores de eval como los que lanzamos con throw
    flashVisor('resultado-err');
    escribir('Error');
    setTimeout(() => escribir('0'), 2000);
  }
}

// Números del 0 al 9
['0','1','2','3','4','5','6','7','8','9'].forEach(n => {
  document.getElementById('btn-' + n)
    .addEventListener('click', () => agregarNumero(n));
});

// Doble cero (00)
document.getElementById('btn-00')
  .addEventListener('click', () => {
    if (valorActual() === '0') return; // No agregar "00" si ya es "0"
    agregarNumero('00');
  });

// Punto decimal
document.getElementById('btn-dot')
  .addEventListener('click', () => agregarNumero('.'));

// Operadores
document.getElementById('btn-add')
  .addEventListener('click', () => agregarOperador('+'));
document.getElementById('btn-sub')
  .addEventListener('click', () => agregarOperador('−'));
document.getElementById('btn-mul')
  .addEventListener('click', () => agregarOperador('×'));
document.getElementById('btn-div')
  .addEventListener('click', () => agregarOperador('÷'));

// Porcentaje
document.getElementById('btn-pct')
  .addEventListener('click', calcularPorcentaje);

// Borrar último
document.getElementById('btn-back')
  .addEventListener('click', borrarUltimo);

// Limpiar
document.getElementById('btn-c')
  .addEventListener('click', limpiar);

// Igual
document.getElementById('btn-eq')
  .addEventListener('click', evaluar);
