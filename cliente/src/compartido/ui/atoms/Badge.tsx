interface BadgeProps {
  texto: string;
  variante?: 'activo' | 'inactivo' | 'adm' | 'examinador' | 'participante' | 'neutro';
}

const estilosPorVariante: Record<NonNullable<BadgeProps['variante']>, string> = {
  activo: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
  inactivo: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  adm: 'bg-violet-100 text-violet-800 ring-1 ring-violet-200',
  examinador: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',
  participante: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  neutro: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

export function Badge({ texto, variante = 'neutro' }: BadgeProps): JSX.Element {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${estilosPorVariante[variante]}`}
    >
      {texto}
    </span>
  );
}
