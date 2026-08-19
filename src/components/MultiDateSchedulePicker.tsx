import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CalendarDays,
  Sparkles,
  X,
  CheckCircle2
} from 'lucide-react';

export interface TimeSlot {
  horaInicio: string;
  horaFim: string;
}

interface MultiDateSchedulePickerProps {
  role: 'profissional' | 'estagiario';
  selectedDates: string[];
  onChangeDates: (dates: string[]) => void;
  selectedTimes: TimeSlot[];
  onChangeTimes: (times: TimeSlot[]) => void;
  observacoes?: string;
  onChangeObservacoes?: (obs: string) => void;
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { horaInicio: '08:00', horaFim: '09:00' },
  { horaInicio: '09:30', horaFim: '10:30' },
  { horaInicio: '11:00', horaFim: '12:00' },
  { horaInicio: '14:00', horaFim: '15:00' },
  { horaInicio: '15:30', horaFim: '16:30' },
  { horaInicio: '17:00', horaFim: '18:00' }
];

export const MultiDateSchedulePicker: React.FC<MultiDateSchedulePickerProps> = ({
  role,
  selectedDates,
  onChangeDates,
  selectedTimes,
  onChangeTimes,
  observacoes,
  onChangeObservacoes
}) => {
  // Input for adding a single date
  const [inputDate, setInputDate] = useState<string>('');
  
  // Input for adding a custom time range
  const [customInicio, setCustomInicio] = useState<string>('08:00');
  const [customFim, setCustomFim] = useState<string>('09:00');

  // Format YYYY-MM-DD to readable pt-BR date
  const formatDateLabel = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayMonth = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
      return `${dayMonth} (${dayName.replace('.', '')})`;
    } catch {
      return dateStr;
    }
  };

  // Helper to get formatted string YYYY-MM-DD
  const toDateString = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Add individual date
  const handleAddDate = () => {
    if (!inputDate) return;
    if (!selectedDates.includes(inputDate)) {
      const updated = [...selectedDates, inputDate].sort();
      onChangeDates(updated);
    }
    setInputDate('');
  };

  // Add Quick Dates (e.g. Next 5 weekdays)
  const handleAddNext5Weekdays = () => {
    const dates: string[] = [];
    let current = new Date();
    // start from tomorrow or today if morning
    current.setDate(current.getDate() + 1);

    while (dates.length < 5) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Not Sunday or Saturday
        dates.push(toDateString(current));
      }
      current.setDate(current.getDate() + 1);
    }

    const merged = Array.from(new Set([...selectedDates, ...dates])).sort();
    onChangeDates(merged);
  };

  const handleAddTomorrow = () => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const dateStr = toDateString(tmrw);
    if (!selectedDates.includes(dateStr)) {
      onChangeDates([...selectedDates, dateStr].sort());
    }
  };

  const handleAddThisWeek = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        dates.push(toDateString(d));
      }
    }
    const merged = Array.from(new Set([...selectedDates, ...dates])).sort();
    onChangeDates(merged);
  };

  const handleRemoveDate = (dateToRemove: string) => {
    onChangeDates(selectedDates.filter(d => d !== dateToRemove));
  };

  const handleClearAllDates = () => {
    onChangeDates([]);
  };

  // Toggle standard time slot
  const handleToggleSlot = (slot: TimeSlot) => {
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

  const isSlotSelected = (slot: TimeSlot) => {
    return selectedTimes.some(
      s => s.horaInicio === slot.horaInicio && s.horaFim === slot.horaFim
    );
  };

  // Add custom time slot
  const handleAddCustomTime = (e: React.FormEvent) => {
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

  const handleRemoveTime = (indexToRemove: number) => {
    onChangeTimes(selectedTimes.filter((_, idx) => idx !== indexToRemove));
  };

  // Presets for times
  const handleSelectMorningSlots = () => {
    const morning = [
      { horaInicio: '08:00', horaFim: '09:00' },
      { horaInicio: '09:30', horaFim: '10:30' },
      { horaInicio: '11:00', horaFim: '12:00' }
    ];
    const merged = [...selectedTimes];
    morning.forEach(m => {
      if (!merged.some(s => s.horaInicio === m.horaInicio && s.horaFim === m.horaFim)) {
        merged.push(m);
      }
    });
    onChangeTimes(merged.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)));
  };

  const handleSelectAfternoonSlots = () => {
    const afternoon = [
      { horaInicio: '14:00', horaFim: '15:00' },
      { horaInicio: '15:30', horaFim: '16:30' },
      { horaInicio: '17:00', horaFim: '18:00' }
    ];
    const merged = [...selectedTimes];
    afternoon.forEach(m => {
      if (!merged.some(s => s.horaInicio === m.horaInicio && s.horaFim === m.horaFim)) {
        merged.push(m);
      }
    });
    onChangeTimes(merged.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)));
  };

  const handleSelectAllDaySlots = () => {
    onChangeTimes([...DEFAULT_TIME_SLOTS]);
  };

  const totalSlotsCalculated = selectedDates.length * selectedTimes.length;

  const roleTitle = role === 'profissional'
    ? 'Grade de Atendimento (Múltiplas Datas e Horários)'
    : 'Disponibilidade de Estágio (Múltiplas Datas e Horários)';

  const roleSubtitle = role === 'profissional'
    ? 'Defina os dias e os horários em que você poderá atender os pacientes na Clínica Escola.'
    : 'Defina os dias e os horários em que você estará presente e disponível para acompanhar os atendimentos.';

  const themeColor = role === 'profissional' ? '#82954B' : '#A37B75';
  const themeBgLight = role === 'profissional' ? 'bg-[#F1F8E9]' : 'bg-[#F5EBE6]';
  const themeBorder = role === 'profissional' ? 'border-[#D0E3B6]' : 'border-[#E5D2CB]';

  return (
    <div className={`p-4 rounded-2xl border ${themeBorder} ${themeBgLight} space-y-4 text-xs animate-in fade-in`}>
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b pb-2.5 border-[#E5E1D8]">
        <div>
          <h3 className="font-serif font-bold text-sm text-[#434343] flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" style={{ color: themeColor }} />
            {roleTitle}
          </h3>
          <p className="text-[11px] text-[#5C5C5C] mt-0.5">
            {roleSubtitle}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#434343] border border-[#E5E1D8] shrink-0">
          Opcional no cadastro
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. SELEÇÃO DE MÚLTIPLAS DATAS */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E5E1D8] space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <label className="font-bold text-[#434343] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" style={{ color: themeColor }} />
            1. Escolha as Datas ({selectedDates.length} selecionada{selectedDates.length !== 1 ? 's' : ''})
          </label>
          {selectedDates.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllDates}
              className="text-[10px] text-[#E98074] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Limpar datas
            </button>
          )}
        </div>

        {/* Date Input + Add Button */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            min={toDateString(new Date())}
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
          />
          <button
            type="button"
            onClick={handleAddDate}
            disabled={!inputDate}
            className="px-3 py-2 bg-[#82954B] hover:bg-[#6F803E] disabled:opacity-40 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Data
          </button>
        </div>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-[#8E8D8A] font-semibold mr-1">Atalhos rápidos:</span>
          <button
            type="button"
            onClick={handleAddTomorrow}
            className="px-2 py-1 bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#5C5C5C] rounded-lg text-[11px] border border-[#E5E1D8] transition-colors cursor-pointer"
          >
            + Amanhã
          </button>
          <button
            type="button"
            onClick={handleAddThisWeek}
            className="px-2 py-1 bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#5C5C5C] rounded-lg text-[11px] border border-[#E5E1D8] transition-colors cursor-pointer"
          >
            + Esta Semana (Seg-Sex)
          </button>
          <button
            type="button"
            onClick={handleAddNext5Weekdays}
            className="px-2 py-1 bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#5C5C5C] rounded-lg text-[11px] border border-[#E5E1D8] transition-colors cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#82954B]" /> + Próximos 5 Dias Úteis
          </button>
        </div>

        {/* Selected Dates Badges */}
        {selectedDates.length > 0 ? (
          <div className="pt-2 border-t border-[#F0ECE1]">
            <p className="text-[10px] font-semibold text-[#8E8D8A] mb-1.5">
              Datas selecionadas para atendimento:
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {selectedDates.map((dateStr) => (
                <span
                  key={dateStr}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6] text-xs font-semibold shadow-2xs animate-in zoom-in-95"
                >
                  <Calendar className="w-3 h-3" />
                  {formatDateLabel(dateStr)}
                  <button
                    type="button"
                    onClick={() => handleRemoveDate(dateStr)}
                    className="ml-1 hover:text-[#E98074] p-0.5 rounded-full hover:bg-white/60 transition-colors cursor-pointer"
                    title="Remover data"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-[#8E8D8A] italic bg-[#FDFBF7] p-2 rounded-lg border border-dashed border-[#E5E1D8] text-center">
            Nenhuma data selecionada ainda. Escolha datas no calendário acima ou use os botões rápidos.
          </p>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. SELEÇÃO DE MÚLTIPLOS HORÁRIOS */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E5E1D8] space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <label className="font-bold text-[#434343] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" style={{ color: themeColor }} />
            2. Escolha os Horários ({selectedTimes.length} selecionado{selectedTimes.length !== 1 ? 's' : ''})
          </label>
          {selectedTimes.length > 0 && (
            <button
              type="button"
              onClick={() => onChangeTimes([])}
              className="text-[10px] text-[#E98074] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Limpar horários
            </button>
          )}
        </div>

        {/* Quick Shift Selection */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-[#8E8D8A] font-semibold mr-1">Turnos rápidos:</span>
          <button
            type="button"
            onClick={handleSelectMorningSlots}
            className="px-2 py-1 bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#5C5C5C] rounded-lg text-[11px] border border-[#E5E1D8] cursor-pointer transition-colors"
          >
            Manhã (08h - 12h)
          </button>
          <button
            type="button"
            onClick={handleSelectAfternoonSlots}
            className="px-2 py-1 bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#5C5C5C] rounded-lg text-[11px] border border-[#E5E1D8] cursor-pointer transition-colors"
          >
            Tarde (14h - 18h)
          </button>
          <button
            type="button"
            onClick={handleSelectAllDaySlots}
            className="px-2 py-1 bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#5C5C5C] rounded-lg text-[11px] border border-[#E5E1D8] cursor-pointer transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#82954B]" /> Dia Completo (6 Horários)
          </button>
        </div>

        {/* Standard Interactive Toggleable Chips */}
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-[#8E8D8A]">
            Clique para selecionar ou desmarcar horários padrão:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {DEFAULT_TIME_SLOTS.map((slot) => {
              const active = isSlotSelected(slot);
              return (
                <button
                  key={`${slot.horaInicio}-${slot.horaFim}`}
                  type="button"
                  onClick={() => handleToggleSlot(slot)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                    active
                      ? 'bg-[#82954B] text-white border-[#6F803E] shadow-xs'
                      : 'bg-[#FDFBF7] text-[#5C5C5C] border-[#E5E1D8] hover:bg-[#EDEAE3]'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {slot.horaInicio} às {slot.horaFim}
                  </span>
                  {active && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Slot Adder */}
        <div className="pt-2 border-t border-[#F0ECE1] space-y-1.5">
          <p className="text-[10px] font-semibold text-[#8E8D8A]">
            Ou adicione um horário personalizado:
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl px-2 py-1.5 flex-1">
              <span className="text-[11px] text-[#8E8D8A]">Das</span>
              <input
                type="time"
                value={customInicio}
                onChange={(e) => setCustomInicio(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-[#434343] focus:outline-none"
              />
              <span className="text-[11px] text-[#8E8D8A]">às</span>
              <input
                type="time"
                value={customFim}
                onChange={(e) => setCustomFim(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-[#434343] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddCustomTime}
              className="px-3 py-2 bg-white border border-[#E5E1D8] hover:bg-[#F8F5F0] text-[#434343] rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#82954B]" /> Adicionar
            </button>
          </div>
        </div>

        {/* Active Custom / All Selected Times List */}
        {selectedTimes.length > 0 && (
          <div className="pt-1.5 flex flex-wrap gap-1">
            {selectedTimes.map((slot, idx) => (
              <span
                key={`${slot.horaInicio}-${slot.horaFim}-${idx}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EDEAE3] text-[#434343] text-[11px] font-medium"
              >
                {slot.horaInicio} - {slot.horaFim}
                <button
                  type="button"
                  onClick={() => handleRemoveTime(idx)}
                  className="hover:text-[#E98074] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Optional Note field for interns */}
      {role === 'estagiario' && onChangeObservacoes && (
        <div className="bg-white p-3 rounded-xl border border-[#E5E1D8] space-y-1">
          <label className="font-semibold text-[#5C5C5C] text-[11px] block">
            Observações sobre sua disponibilidade (Opcional):
          </label>
          <input
            type="text"
            placeholder="Ex: Disponível para atendimentos em psicoterapia e triagens"
            value={observacoes || ''}
            onChange={(e) => onChangeObservacoes(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RESUMO DO CÁLCULO DAS VAGAS GERADAS */}
      {/* ========================================================================= */}
      <div className="p-3 bg-white rounded-xl border border-[#E5E1D8] shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#434343] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#82954B]" />
            Resumo dos Horários que Serão Criados
          </span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
            totalSlotsCalculated > 0
              ? 'bg-[#82954B] text-white'
              : 'bg-[#EDEAE3] text-[#8E8D8A]'
          }`}>
            {totalSlotsCalculated} {role === 'profissional' ? 'Vagas' : 'Turnos'}
          </span>
        </div>

        {totalSlotsCalculated > 0 ? (
          <div className="text-[11px] text-[#5C5C5C] space-y-1">
            <p>
              Ao concluir o cadastro, o sistema irá criar automaticamente <strong>{totalSlotsCalculated} horários disponíveis</strong> combinando as <strong>{selectedDates.length} datas</strong> com os <strong>{selectedTimes.length} horários</strong> configurados.
            </p>
            <div className="bg-[#F8F5F0] p-2 rounded-lg text-[10px] text-[#8E8D8A] max-h-20 overflow-y-auto space-y-0.5">
              {selectedDates.map(d => (
                <div key={d}>
                  <strong className="text-[#434343]">{formatDateLabel(d)}:</strong>{' '}
                  {selectedTimes.map(t => `${t.horaInicio} às ${t.horaFim}`).join(', ')}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-[#8E8D8A]">
            Selecione pelo menos 1 data e 1 horário para gerar a grade inicial (você também poderá adicionar e gerenciar novos horários a qualquer momento após o login).
          </p>
        )}
      </div>

    </div>
  );
};
