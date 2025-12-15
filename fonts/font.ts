export const Fonts = {
  Instrument: {
    Sans: {
      Regular: 'InstrumentSans_400Regular',
      Bold: 'InstrumentSans_700Bold',
    },
    Serif: {
      Regular: 'InstrumentSerif_400Regular',
    },
  },
} as const;

export type InstrumentSans = typeof Fonts.Instrument.Sans[keyof typeof Fonts.Instrument.Sans];
export type InstrumentSerif = typeof Fonts.Instrument.Serif[keyof typeof Fonts.Instrument.Serif];

// union of all font string constants
export type FontFamily = InstrumentSans | InstrumentSerif;
