import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import { TimeSlot } from './MultiDateSchedulePicker';

interface UnifiedProfessionalCalendarPickerProps {
  selectedDates: string[];
  onChangeDates: (dates: string[]) => void;
  selectedTimes: TimeSlot[];
  onChangeTimes: (times: TimeSlot[]) => void;
  onSalvar: (e: React.FormEvent) => void;
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { horaInicio: '08:00', horaFim: '09:00' },
  { horaInicio: '09:00', horaFim: '10:00' },
  { horaInicio: '10:00', horaFim: '11:00' },
  { horaInicio: '11:00', horaFim: '12:00' },
  { horaInicio: '13:00', horaFim: '14:00' },
  { horaInicio: '14:00', horaFim: '15:00' },
  { horaInicio: '15:00', horaFim: '16:00' },
  { horaInicio: '16:00', horaFim: '17:00' },
  { horaInicio: '17:00', horaFim: '18:00' },
  { horaInicio: '18:00', horaFim: '19:00' },
  { horaInicio: '19:00', horaFim: '20:00' }
];

const WEEKDAY_NAMES = [
  { dayIndex: 1, label: 'Seg', fullName: 'Segunda-feira' },
  { dayIndex: 2, label: 'Ter', fullName: 'Terça-feira' },
  { dayIndex: 3, label: 'Qua', fullName: 'Quarta-feira' },
  { dayIndex: 4, label: 'Qui', fullName: 'Quinta-feira' },
  { dayIndex: 5, label: 'Sex', fullName: 'Sexta-feira' },
  { dayIndex: 6, label: 'Sáb', fullName: 'Sábado' }
];

export const UnifiedProfessionalCalendarPicker: React.FC<UnifiedProfessionalCalendarPickerProps> = ({
  selectedDates,
  onChangeDates,
  selectedTimes,
  onChangeTimes,
  onSalvar
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [customInicio, setCustomInicio] = useState<string>('08:00');
  const [customFim, setCustomFim] = useState<string>('09:00');

  // Month navigation
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

  // Calculate calendar grid days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const toDateString = (y: number, m: number, d: number): string => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const todayStr = (() => {
    const t = new Date();
    return toDateString(t.getFullYear(), t.getMonth(), t.getDate());
  })();

  const toggleDate = (dateStr: string) => {
    if (selectedDates.includes(dateStr)) {
      onChangeDates(selectedDates.filter(d => d !== dateStr));
    } else {
      onChangeDates([...selectedDates, dateStr].sort());
    }
  };

  // Toggle all occurrences of a weekday in this month
  const toggleWeekdayInMonth = (weekdayIndex: number) => {
    const monthDates: string[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      if (d.getDay() === weekdayIndex) {
        const dStr = toDateString(year, month, day);
        if (dStr >= todayStr) {
          monthDates.push(dStr);
        }
      }
    }

    const allSelected = monthDates.every(d => selectedDates.includes(d));
    if (allSelected) {
      // Deselect all for this weekday
      onChangeDates(selectedDates.filter(d => !monthDates.includes(d)));
    } else {
      // Select all for this weekday
      const merged = Array.from(new Set([...selectedDates, ...monthDates])).sort();
      onChangeDates(merged);
    }
  };

  const selectNext5Weekdays = () => {
    const dates: string[] = [];
    let cur = new Date();
    cur.setDate(cur.getDate() + 1);

    while (dates.length < 5) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        dates.push(toDateString(cur.getFullYear(), cur.getMonth(), cur.getDate()));
      }
      cur.setDate(cur.getDate() + 1);
    }
    const merged = Array.from(new Set([...selectedDates, ...dates])).sort();
    onChangeDates(merged);
  };

  const toggleSlot = (slot: TimeSlot) => {
    const exists = selectedTimes.some(
      s => s.horaInicio === slot.horaInicio && s.horaFim === slot.horaFim
    );
    if (exists) {
      onChangeTimes(
        selectedTimes.filter(
          s => !(s.horaInicio === slot.horaInicio && s.horaFim === slot.horaFim)
        )
      );
    } else {
      const updated = [...selectedTimes, slot].sort((a, b) =>
        a.horaInicio.localeCompare(b.horaInicio)
      );
      onChangeTimes(updated);
    }
  };

  const handleAddCustomSlot = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!customInicio || !customFim) return;
    if (customInicio >= customFim) {
      alert('O horário de início deve ser anterior ao horário de término.');
      return;
    }
    const newSlot: TimeSlot = { horaInicio: customInicio, horaFim: customFim };
    const exists = selectedTimes.some(
      s => s.horaInicio === newSlot.horaInicio && s.horaFim === newSlot.horaFim
    );
    if (!exists) {
      const updated = [...selectedTimes, newSlot].sort((a, b) =>
        a.horaInicio.localeCompare(b.horaInicio)
      );
      onChangeTimes(updated);
    }
  };

  const totalSlotsGenerated = selectedDates.length * selectedTimes.length;

  return (
    <form onSubmit={onSalvar} className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E5E1D8] shadow-xs p-6 space-y-6">
        
        {/* Title & Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E1D8] pb-4">
          <div>
            <h3 className="text-base font-serif font-bold text-[#434343] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#82954B]" />
              Calendário de Disponibilidade de Atendimento
            </h3>
            <p className="text-xs text-[#8E8D8A] mt-0.5">
              Selecione os dias da semana ou datas no calendário e os horários em que você estará disponível.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectNext5Weekdays}
              className="px-3 py-1.5 bg-[#F1F8E9] hover:bg-[#E1EED1] text-[#82954B] text-xs font-bold rounded-xl border border-[#D0E3B6] transition-colors cursor-pointer"
            >
              + Próximos 5 Dias Úteis
            </button>
            {selectedDates.length > 0 && (
              <button
                type="button"
                onClick={() => onChangeDates([])}
                className="px-3 py-1.5 bg-[#FDF0EE] hover:bg-[#FBE2DE] text-[#E98074] text-xs font-bold rounded-xl border border-[#F7C4BE] transition-colors cursor-pointer"
              >
                Limpar Datas
              </button>
            )}
          </div>
        </div>

        {/* Unified 2-Column Section: Calendar Grid (Left) + Hours Picker (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: CALENDAR (7 cols) */}
          <div className="lg:col-span-7 bg-[#FDFBF7] p-4 sm:p-5 rounded-2xl border border-[#E5E1D8] space-y-4">
            
            {/* Month Header */}
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm sm:text-base capitalize text-[#434343]">
                {monthYearLabel}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-white text-[#434343] rounded-lg border border-[#E5E1D8] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-white text-[#434343] rounded-lg border border-[#E5E1D8] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Weekday Selectors */}
            <div>
              <p className="text-[11px] font-bold text-[#8E8D8A] mb-1.5">
                Clique nos dias da semana para selecionar todo o mês:
              </p>
              <div className="grid grid-cols-6 gap-1.5">
                {WEEKDAY_NAMES.map(w => (
                  <button
                    key={w.dayIndex}
                    type="button"
                    onClick={() => toggleWeekdayInMonth(w.dayIndex)}
                    className="py-1.5 px-1 text-center bg-white hover:bg-[#82954B]/10 hover:text-[#82954B] text-[#5C5C5C] text-xs font-bold rounded-lg border border-[#E5E1D8] transition-all cursor-pointer"
                    title={`Selecionar todas as ${w.fullName}s deste mês`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Days Grid */}
            <div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#8E8D8A] mb-1">
                <span>Dom</span>
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Empty days before month start */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10 sm:h-11 rounded-xl opacity-0 pointer-events-none" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = toDateString(year, month, dayNum);
                  const isPast = dateStr < todayStr;
                  const isSelected = selectedDates.includes(dateStr);
                  const isToday = dateStr === todayStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={isPast}
                      onClick={() => toggleDate(dateStr)}
                      className={`h-10 sm:h-11 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                        isPast
                          ? 'opacity-30 text-[#8E8D8A] bg-transparent cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#82954B] text-white shadow-xs scale-102 ring-2 ring-[#82954B]/30 font-black'
                          : 'bg-white hover:bg-[#F1F8E9] text-[#434343] border border-[#E5E1D8] hover:border-[#82954B]'
                      }`}
                    >
                      <span>{dayNum}</span>
                      {isToday && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#82954B] absolute bottom-1" />
                      )}
                      {isSelected && (
                        <span className="text-[9px] leading-tight font-normal opacity-90">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Days count badge */}
            <div className="pt-2 border-t border-[#E5E1D8] flex items-center justify-between text-xs text-[#5C5C5C]">
              <span>
                <strong>{selectedDates.length}</strong> {selectedDates.length === 1 ? 'dia selecionado' : 'dias selecionados'}
              </span>
              {selectedDates.length > 0 && (
                <span className="text-[11px] text-[#82954B] font-semibold">
                  Datas prontas para receber os horários
                </span>
              )}
            </div>
          </div>

          {/* RIGHT: HOURS SELECTION (5 cols) */}
          <div className="lg:col-span-5 bg-[#FDFBF7] p-4 sm:p-5 rounded-2xl border border-[#E5E1D8] space-y-4">
            <div>
              <h4 className="font-serif font-bold text-sm text-[#434343] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#82954B]" />
                Horários de Atendimento
              </h4>
              <p className="text-xs text-[#8E8D8A] mt-0.5">
                Clique nos blocos para ativar/desativar os horários disponíveis:
              </p>
            </div>

            {/* Default Slots Grid */}
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_TIME_SLOTS.map((slot) => {
                const isSelected = selectedTimes.some(
                  s => s.horaInicio === slot.horaInicio && s.horaFim === slot.horaFim
                );
                return (
                  <button
                    key={`${slot.horaInicio}-${slot.horaFim}`}
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                      isSelected
                        ? 'bg-[#82954B] text-white border-[#82954B] shadow-xs'
                        : 'bg-white hover:bg-[#F1F8E9] text-[#5C5C5C] border-[#E5E1D8]'
                    }`}
                  >
                    {slot.horaInicio} às {slot.horaFim}
                  </button>
                );
              })}
            </div>

            {/* Custom Time Slot Adder */}
            <div className="p-3 bg-white rounded-xl border border-[#E5E1D8] space-y-2">
              <label className="block text-[11px] font-bold text-[#5C5C5C]">
                + Adicionar Horário Personalizado:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={customInicio}
                  onChange={(e) => setCustomInicio(e.target.value)}
                  className="w-full p-1.5 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg font-bold text-[#434343]"
                />
                <span className="text-xs text-[#8E8D8A]">às</span>
                <input
                  type="time"
                  value={customFim}
                  onChange={(e) => setCustomFim(e.target.value)}
                  className="w-full p-1.5 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg font-bold text-[#434343]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSlot}
                  className="p-1.5 bg-[#82954B] hover:bg-[#6D7D3F] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                  title="Adicionar horário"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total summary */}
            <div className="bg-[#F1F8E9] p-3 rounded-xl border border-[#D0E3B6] text-xs text-[#434343] space-y-1">
              <p className="font-bold text-[#82954B] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Resumo da Grade de Atendimentos
              </p>
              <p className="text-[11px] text-[#5C5C5C]">
                {selectedDates.length} dia(s) × {selectedTimes.length} horário(s) = <strong>{totalSlotsGenerated} vaga(s) de consulta</strong>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={totalSlotsGenerated === 0}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                totalSlotsGenerated > 0
                  ? 'bg-[#82954B] hover:bg-[#6D7D3F] text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar {totalSlotsGenerated} Horários na Agenda
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
