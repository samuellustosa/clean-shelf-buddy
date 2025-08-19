// src/telegramBot.ts

import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '@/integrations/supabase/client';
import type { Equipment } from '@/types/equipment';
import { getEquipmentStatus, getDaysUntilNextCleaning } from '@/utils/equipmentUtils';
import TelegramBot from 'node-telegram-bot-api';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('Erro: Variáveis de ambiente TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não estão definidas.');
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

async function sendNotifications() {
  console.log('Buscando equipamentos...');

  const { data: equipmentList, error } = await supabase
    .from('equipment')
    .select('*');

  if (error) {
    console.error('Erro ao buscar equipamentos:', error);
    return;
  }

  const warningList: Equipment[] = [];
  const overdueList: Equipment[] = [];

  for (const item of equipmentList) {
    const status = getEquipmentStatus(item);
    if (status === 'warning') {
      warningList.push(item);
    } else if (status === 'overdue') {
      overdueList.push(item);
    }
  }

  if (warningList.length > 0) {
    const message = `⚠️ *AVISO - Prazo de limpeza finalizando!* ⚠️\n\n` +
      warningList.map(item => `- *${item.name}* (${item.sector})\n  - Responsável: ${item.responsible}\n  - Próxima limpeza em: 1 dia\n`).join('\n');
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
  }

  if (overdueList.length > 0) {
    const message = `🚨 *ATENÇÃO - Limpeza atrasada!* 🚨\n\n` +
      overdueList.map(item => `- *${item.name}* (${item.sector})\n  - Responsável: ${item.responsible}\n  - Atrasado em: ${Math.abs(getDaysUntilNextCleaning(item))} dias\n`).join('\n');
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
  }

  console.log('Notificações enviadas.');
}

sendNotifications().catch(console.error);