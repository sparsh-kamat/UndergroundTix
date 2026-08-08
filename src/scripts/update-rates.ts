// scripts/update-rates.ts
import { PrismaClient, Prisma } from '@prisma/client';
import "dotenv/config"; // To load environment variables from .env
import { pathToFileURL } from "node:url";

const prisma = new PrismaClient();

interface FreeCurrencyApiResponse {
  data: { [key: string]: number };
}

async function fetchRatesFromApi(baseCurrency: string = 'INR'): Promise<{ [key: string]: number } | null> {
  const apiKey = process.env.FREECURRENCYAPI_KEY;
  if (!apiKey) {
    console.error("FREECURRENCYAPI_KEY environment variable not set.");
    return null;
  }
  
  const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${baseCurrency}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from currency API: ${response.statusText}`);
    }
    const data: FreeCurrencyApiResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching rates from external API:", error);
    return null;
  }
}

export async function updateDatabaseRates() {
  console.log("Starting to update exchange rates...");
  const rates = await fetchRatesFromApi('INR');

  if (!rates) {
    console.log("Could not fetch new rates. Aborting update.");
    return;
  }

  //update all rates at once
  const updateOperations = Object.entries(rates).map(([currencyCode, rate]) => {
    //invert the rate
    const invertedRate = 1 / rate;

    return prisma.exchangeRate.upsert({
      where: { currencyCode: currencyCode },
      update: { rate: new Prisma.Decimal(invertedRate) },
      create: {
        currencyCode: currencyCode,
        rate: new Prisma.Decimal(invertedRate),
      },
    });
  });

  try {
    await prisma.$transaction(updateOperations);
    console.log(`Successfully updated ${updateOperations.length} currency rates.`);
  } catch (error) {
    console.error("Failed to update rates in the database:", error);
  }
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  updateDatabaseRates()
    .catch((error) => {
      console.error("Exchange-rate update failed:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
