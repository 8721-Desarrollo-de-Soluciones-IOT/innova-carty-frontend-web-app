/**
 * The API and the carts write their texts in English (events, alerts, zones). These rules show
 * them in Spanish. Texts without a rule (product names, codes, amounts) are shown as they come.
 */
type Rule = [RegExp, (m: RegExpMatchArray) => string];

const CATEGORIES: Record<string, string> = {
  Produce: 'Frutas y verduras',
  Bakery: 'Panadería',
  Seafood: 'Pescados',
  Dairy: 'Lácteos',
  Beverages: 'Bebidas',
  Meat: 'Carnes',
  Household: 'Hogar',
  Grocery: 'Abarrotes',
};

const EXACT: Record<string, string> = {
  // Zones
  Entrance: 'Entrada',
  'Charging bay': 'Zona de carga',
  'the exit': 'la salida',
  // Cart and session
  'Cart registered': 'Carrito registrado',
  'Cart online': 'Carrito en línea',
  'Shopping session started': 'Compra iniciada',
  'Session started': 'Compra iniciada',
  'Shopper took the cart': 'El cliente tomó el carrito',
  'Items updated': 'Productos actualizados',
  'Item added': 'Producto agregado',
  'Item removed': 'Producto retirado',
  'Physical prototype (ESP32) ready': 'Prototipo físico (ESP32) listo',
  'Guest session': 'Sesión de invitado',
  Guest: 'Invitado',
  Released: 'Liberado',
  Charging: 'Cargando',
  'Heartbeat lost': 'Sin señal',
  'App linked': 'App vinculada',
  'Budget set': 'Presupuesto definido',
  // Weight
  'Weight discrepancy': 'Peso no coincide',
  'Weight discrepancy · payment paused': 'Peso no coincide · pago en pausa',
  'Weight back within tolerance': 'Peso dentro de la tolerancia otra vez',
  'Payment paused': 'Pago en pausa',
  // Geofence and unlock
  'Geofence breach': 'Salida sin pagar',
  'Geofence breach · wheels locked': 'Salida sin pagar · ruedas bloqueadas',
  'Geofence crossed unpaid': 'Cruzó la salida sin pagar',
  'Order unpaid': 'Pedido sin pagar',
  'Wheels locked': 'Ruedas bloqueadas',
  'Unlocked with the supervisor key fob': 'Desbloqueado con el llavero del supervisor',
  'Checked by supervisor': 'Revisado por el supervisor',
  'Item added to the order': 'Producto agregado al pedido',
  'Item removed from the cart': 'Producto retirado del carrito',
  'Shopper paid at the cashier': 'El cliente pagó en caja',
  'Item placed again and read correctly': 'Producto pasado otra vez y leído bien',
  'Unregistered item removed from the cart': 'Producto sin registrar retirado del carrito',
  'Personal item (not store merchandise)': 'Objeto personal (no es mercadería)',
  'Shopper paid at assisted checkout': 'El cliente pagó en caja asistida',
  'False alarm, sensor recalibrated': 'Falsa alarma, sensor recalibrado',
  'Flagged for audit': 'Marcado para auditoría',
  // Payment and exit
  'Shopper left the store': 'El cliente salió de la tienda',
  'Session closed': 'Compra cerrada',
  'Checkout QR on screen': 'QR de pago en pantalla',
  'Checkout started': 'Pago iniciado',
  'Checkout cancelled': 'Pago cancelado',
  'Payment QR shown on the cart screen': 'QR de pago en la pantalla del carrito',
  'Exit clearance for 15 min': 'Salida autorizada por 15 min',
  'via mobile app': 'desde la app móvil',
  // Help, RFID and devices
  'Help requested': 'Pidió ayuda',
  'Shopper asked for help': 'El cliente pidió ayuda',
  'Unknown RFID tag': 'Etiqueta RFID desconocida',
  'Unreadable RFID tag': 'Etiqueta RFID ilegible',
  'Not in the catalog': 'No está en el catálogo',
  'Cart offline': 'Carrito sin conexión',
  // Accounts
  'Floor supervisor': 'Supervisor de piso',
  Shopper: 'Comprador',
};

const PAYMENT_METHODS: Record<string, string> = {
  Card: 'Tarjeta',
  'Card on cart': 'tarjeta en el carrito',
};

const method = (m: string) => PAYMENT_METHODS[m] ?? m;

function zone(text: string): string {
  if (EXACT[text]) return EXACT[text];
  const aisle = text.match(/^Aisle (\d+)(?: · (\w+))?$/);
  if (aisle)
    return `Pasillo ${aisle[1]}${aisle[2] ? ' · ' + (CATEGORIES[aisle[2]] ?? aisle[2]) : ''}`;
  const exit = text.match(/^Exit ?(\w*)$/);
  if (exit) return exit[1] ? `Salida ${exit[1]}` : 'Salida';
  return text;
}

const RULES: Rule[] = [
  [
    /^Unlocked by (.+)$/,
    (m) =>
      `Desbloqueado por ${m[1] === 'key fob' ? 'el llavero' : m[1] === 'supervisor' ? 'el supervisor' : m[1]}`,
  ],
  [/^Session (\S+) started$/, (m) => `Pedido ${m[1]} iniciado`],
  [/^First connection of (\S+)$/, (m) => `Primera conexión de ${m[1]}`],
  [/^(\d+) items · (S\/ [\d.]+)$/, (m) => `${m[1]} productos · ${m[2]}`],
  [/^Weight (.+)$/, (m) => `Peso ${translateServerText(m[1])}`],
  [/^([+−-]?\d+) g without (?:tag|RFID read)$/, (m) => `${m[1]} g sin etiqueta`],
  [/^([+−-]?\d+) g missing$/, (m) => `${m[1]} g faltantes`],
  [
    /^(\S+) measured (.+) g, expected (.+) g \(±(.+) g\)\.$/,
    (m) => `${m[1]} midió ${m[2]} g, se esperaban ${m[3]} g (±${m[4]} g).`,
  ],
  [
    /^(\S+) measured (.+) g without an RFID read\. Payment paused\.$/,
    (m) => `${m[1]} midió ${m[2]} g sin lectura RFID. Pago en pausa.`,
  ],
  [/^Geofence breach at (.+)$/, (m) => `Salida sin pagar en ${zone(m[1])}`],
  [/^Wheels locked at (.+)$/, (m) => `Ruedas bloqueadas en ${zone(m[1])}`],
  [/^Crossed (.+) without clearance$/, (m) => `Cruzó ${zone(m[1])} sin autorización`],
  [
    /^(\S+) reached (.+) with order unpaid \((S\/ [\d.]+), (\d+) items\)\.$/,
    (m) => `${m[1]} llegó a ${zone(m[2])} con el pedido sin pagar (${m[3]}, ${m[4]} productos).`,
  ],
  [/^Paid (S\/ [\d.]+) with (.+)$/, (m) => `Pagado ${m[1]} con ${method(m[2])}`],
  [/^Payment approved · (.+)$/, (m) => `Pago aprobado · ${method(m[1])}`],
  [/^Payment confirmed \((.+)\)$/, (m) => `Pago confirmado (${method(m[1])})`],
  [/^(S\/ [\d.]+) · operation (\S+)$/, (m) => `${m[1]} · operación ${m[2]}`],
  [/^(S\/ [\d.]+) of (S\/ [\d.]+)$/, (m) => `${m[1]} de ${m[2]}`],
  [/^(.+) linked the app$/, (m) => `${m[1]} vinculó la app`],
  [/^Linked to (.+) \(app\)$/, (m) => `Vinculado a ${m[1]} (app)`],
  [/^Budget set to (S\/ [\d.]+)$/, (m) => `Presupuesto de ${m[1]}`],
  [/^Budget (\d+)% reached$/, (m) => `Presupuesto al ${m[1]}%`],
  [/^(\S+) asked for assistance at (.+)\.$/, (m) => `${m[1]} pidió asistencia en ${zone(m[2])}.`],
  [
    /^Tag (\S+) read by (\S+) is not in the catalog\.$/,
    (m) => `La etiqueta ${m[1]} leída por ${m[2]} no está en el catálogo.`,
  ],
  [/^Unknown tag (\S+)$/, (m) => `Etiqueta desconocida ${m[1]}`],
  [/^(\S+): resolved by floor staff\.$/, (m) => `${m[1]}: resuelto por el personal de piso.`],
  [
    /^(\S+) detected mass with a damaged tag \(SKU unknown\)\.$/,
    (m) => `${m[1]} detectó un producto con la etiqueta dañada (SKU desconocido).`,
  ],
  [
    /^(\S+) lost heartbeat\. Last battery reading (\d+)%\.$/,
    (m) => `${m[1]} perdió la señal. Última batería: ${m[2]}%.`,
  ],
  [/^Added (.+)$/, (m) => `Agregó ${m[1]}`],
  [/^(Aisle .+|Exit ?\w*)$/, (m) => zone(m[1])],
];

/** Spanish version of a text written by the API, or the same text when there is no rule. */
export function translateServerText(text: string | null | undefined): string {
  if (!text) return text ?? '';
  if (EXACT[text]) return EXACT[text];
  for (const [pattern, render] of RULES) {
    const match = text.match(pattern);
    if (match) return render(match);
  }
  return text;
}
