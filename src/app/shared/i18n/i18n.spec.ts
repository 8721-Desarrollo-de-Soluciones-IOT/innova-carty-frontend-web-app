import { TestBed } from '@angular/core/testing';
import { I18n } from './i18n.service';
import { MESSAGES } from './messages';
import { translateServerText } from './server-texts';

describe('I18n', () => {
  beforeEach(() => localStorage.clear());

  it('starts in Spanish and switches to English', () => {
    const i18n = TestBed.inject(I18n);
    expect(i18n.lang()).toBe('es');
    expect(i18n.t('nav.carts')).toBe('Carritos');

    i18n.setLang('en');
    expect(i18n.t('nav.carts')).toBe('Carts');
  });

  it('fills the placeholders', () => {
    const i18n = TestBed.inject(I18n);
    expect(i18n.t('cart.order', { id: 'ORD-1' })).toBe('Pedido ORD-1');
  });

  it('has the same keys in both languages', () => {
    expect(Object.keys(MESSAGES.es).sort()).toEqual(Object.keys(MESSAGES.en).sort());
  });

  it('shows API texts as they come in English', () => {
    const i18n = TestBed.inject(I18n);
    i18n.setLang('en');
    expect(i18n.server('Geofence breach · wheels locked')).toBe('Geofence breach · wheels locked');
  });
});

describe('translateServerText', () => {
  it('translates the texts written by the API and the carts', () => {
    expect(translateServerText('Geofence breach · wheels locked')).toBe(
      'Salida sin pagar · ruedas bloqueadas',
    );
    expect(translateServerText('Paid S/ 12.50 with Yape')).toBe('Pagado S/ 12.50 con Yape');
    expect(translateServerText('Payment approved · Card')).toBe('Pago aprobado · Tarjeta');
    expect(translateServerText('Weight +412 g without tag')).toBe('Peso +412 g sin etiqueta');
    expect(
      translateServerText('CART-0427 reached Exit 1 with order unpaid (S/ 9.30, 2 items).'),
    ).toBe('CART-0427 llegó a Salida 1 con el pedido sin pagar (S/ 9.30, 2 productos).');
    expect(translateServerText('Unlocked by Lucía Medina')).toBe('Desbloqueado por Lucía Medina');
  });

  it('translates zones of the store', () => {
    expect(translateServerText('Aisle 4 · Dairy')).toBe('Pasillo 4 · Lácteos');
    expect(translateServerText('Exit B')).toBe('Salida B');
    expect(translateServerText('Entrance')).toBe('Entrada');
  });

  it('keeps product names and unknown texts', () => {
    expect(translateServerText('+1 Leche entera 1 L')).toBe('+1 Leche entera 1 L');
    expect(translateServerText(null)).toBe('');
  });
});
