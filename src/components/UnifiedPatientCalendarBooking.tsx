import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Stethoscope,
  MapPin,
  CalendarCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { HorarioDisponivel } from '../types';

interface UnifiedPatientCalendarBookingProps {
  horariosDisponiveis: HorarioDisponivel[];
  onSelectSlot: (slot: HorarioDisponivel) => void;
}

export const UnifiedPatientCalendarBooking: React.FC<UnifiedPatientCalendarBookingProps> = ({
  horariosDisponiveis,
  onSelectSlot
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Find earliest available date or default to current month
    if (horariosDisponiveis.length > 0) {
      const sorted = [...horariosDisponiveis].sort((a, b) => a.data.localeCompare(b.data));
      const [y, m] = sorted[0].data.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(() => {
    if (horariosDisponiveis.length > 0) {
      const sorted = [...horariosDisponiveis].sort((a, b) => a.data.localeCompare(b.data));
      return sorted[0].data;
    }
    return null;
  });

  // Today string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const t = new Date();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    return `${t.getFullYear()}-${mm}-${dd}`;
  }, []);

  // Map available slots by date
  const slotsByDate = useMemo(() => {
    const map: Record<string, HorarioDisponivel[]> = {};
    for (const h of horariosDisponiveis) {
      if (!map[h.data]) {
        map[h.data] = [];
      }
      map[h.data].push(h);
    }
    // Sort slots by start time
    for (const d in map) {
      map[d].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    }
    return map;
  }, [horariosDisponiveis]);

  // Calendar month/year
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthYearLabel = currentDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  const toDateString = (y: number, m: number, d: number): string => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Selected date slots
  const selectedDateSlots = selectedDateStr ? slotsByDate[selectedDateStr] || [] : [];

  const selectedDateFormatted = useMemo(() => {
    if (!selectedDateStr) return null;
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [selectedDateStr]);

  return (
    <div className="bg-white rounded-3xl border border-[#E5E1D8] shadow-xs p-5 sm:p-7 space-y-6">
      {/* Title & Guidelines */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E1D8] pb-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-[#434343] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#82954B]" />
            Calendário de Agendamento de Consultas
          </h3>
          <p className="text-xs text-[#8E8D8A] mt-0.5">
            Dias em <strong>verde</strong> possuem vagas disponíveis. Clique no dia para visualizar os horários ao lado.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-[#F8F5F0] p-2 sm:px-3 rounded-xl border border-[#E5E1D8]">
          <div className="flex items-center gap-1.5 font-medium text-[#2E7D32]">
            <span className="w-3.5 h-3.5 rounded-md bg-[#E8F5E9] border border-[#82954B] inline-block shrink-0" />
            <span>Disponível (Verde)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-[#8E8D8A]">
            <span className="w-3.5 h-3.5 rounded-md bg-[#F0EFEB] border border-[#D8D2C2] inline-block shrink-0" />
            <span>Indisponível (Cinza)</span>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Left Calendar Grid / Right Available Times */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: THE UNIFIED CALENDAR (7 cols) */}
        <div className="lg:col-span-7 bg-[#FDFBF7] p-4 sm:p-5 rounded-2xl border border-[#E5E1D8] space-y-4">
          
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-base capitalize text-[#434343]">
              {monthYearLabel}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 hover:bg-white text-[#434343] rounded-lg border border-[#E5E1D8] transition-colors cursor-pointer"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 hover:bg-white text-[#434343] rounded-lg border border-[#E5E1D8] transition-colors cursor-pointer"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#8E8D8A]">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset before start of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-12 sm:h-14 rounded-xl opacity-0 pointer-events-none" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = toDateString(year, month, dayNum);
              const daySlots = slotsByDate[dateStr] || [];
              const hasSlots = daySlots.length > 0;
              const isPast = dateStr < todayStr;
              const isAvailable = hasSlots && !isPast;
              const isSelected = selectedDateStr === dateStr;
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => isAvailable && setSelectedDateStr(dateStr)}
                  className={`h-12 sm:h-14 rounded-xl text-xs transition-all flex flex-col items-center justify-between p-1 relative cursor-pointer ${
                    isAvailable
                      ? isSelected
                        ? 'bg-[#82954B] text-white ring-3 ring-[#82954B]/30 shadow-md font-bold scale-102 z-10'
                        : 'bg-[#E8F5E9] hover:bg-[#D0EBCF] text-[#2E7D32] border-2 border-[#82954B]/60 font-bold hover:scale-101 shadow-2xs'
                      : 'bg-[#F0EFEB] text-[#A8A7A1] border border-[#E5E1D8] opacity-60 cursor-not-allowed'
                  }`}
                  title={
                    isAvailable
                      ? `${daySlots.length} vaga(s) disponível(is) para agendamento`
                      : isPast
                      ? 'Data passada'
                      : 'Sem horários disponíveis'
                  }
                >
                  <div className="w-full flex items-center justify-between px-1">
                    <span className={`text-xs ${isAvailable ? 'font-bold' : 'font-normal'}`}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className={`text-[9px] px-1 rounded font-bold ${
                        isSelected ? 'bg-white text-[#82954B]' : 'bg-[#82954B] text-white'
                      }`}>
                        Hoje
                      </span>
                    )}
                  </div>

                  {isAvailable && (
                    <span className={`text-[10px] leading-tight font-bold rounded-md px-1.5 py-0.2 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#82954B] text-white'
                    }`}>
                      {daySlots.length} {daySlots.length === 1 ? 'vaga' : 'vagas'}
                    </span>
                  )}

                  {!isAvailable && (
                    <span className="text-[9px] text-[#A8A7A1] font-light leading-none">
                      -
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-[#8E8D8A] pt-2 border-t border-[#E5E1D8] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#82954B] shrink-0" />
            <span>Total de <strong>{horariosDisponiveis.length}</strong> horários abertos em toda a clínica.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: AVAILABLE TIME SLOTS FOR SELECTED GREEN DAY (5 cols) */}
        <div className="lg:col-span-5 bg-[#FDFBF7] p-4 sm:p-5 rounded-2xl border border-[#E5E1D8] space-y-4 min-h-[380px] flex flex-col">
          
          <div className="border-b border-[#E5E1D8] pb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-[#82954B] block">
              Horários para o dia
            </span>
            <h4 className="font-serif font-bold text-base capitalize text-[#434343] mt-0.5">
              {selectedDateFormatted || 'Selecione um dia em verde'}
            </h4>
          </div>

          {!selectedDateStr || selectedDateSlots.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#8E8D8A] space-y-2">
              <CalendarCheck className="w-10 h-10 text-[#82954B] opacity-40 animate-bounce" />
              <p className="text-xs font-medium text-[#5C5C5C]">
                Clique em qualquer dia destacado em <strong className="text-[#2E7D32]">verde</strong> no calendário para ver os horários disponíveis.
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
              <p className="text-xs text-[#5C5C5C]">
                Exibindo <strong>{selectedDateSlots.length}</strong> {selectedDateSlots.length === 1 ? 'vaga disponível' : 'vagas disponíveis'}:
              </p>

              {selectedDateSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white rounded-2xl p-4 border border-[#E5E1D8] hover:border-[#82954B] transition-all shadow-2xs hover:shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-serif font-bold text-[#434343]">
                      <Clock className="w-4 h-4 text-[#82954B]" />
                      <span>{slot.horaInicio} às {slot.horaFim}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]">
                      Disponível
                    </span>
                  </div>

                  <div className="text-xs text-[#5C5C5C] space-y-1 bg-[#F8F5F0] p-2.5 rounded-xl border border-[#E5E1D8]/60">
                    <p className="font-bold text-[#434343] flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-[#82954B]" />
                      {slot.profissionalNome}
                    </p>
                    <p className="text-[11px] text-[#8E8D8A]">
                      {slot.especialidade || 'Psicologia Clínica & Acolhimento'}
                    </p>
                  </div>

                  <button
                    id={`btn-escolher-horario-${slot.id}`}
                    onClick={() => onSelectSlot(slot)}
                    className="w-full py-2.5 px-3 bg-[#82954B] hover:bg-[#6D7D3F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Agendar este Horário
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
