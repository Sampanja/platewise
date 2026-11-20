# PlatePal

**PlatePal is a meal planning app for students who want to save time and money.**

## Problem and solution

Students juggle tight budgets and little time, so cooking often means expensive takeaway or the same few meals on repeat. PlatePal turns a budget and a few preferences (allergies, diet, number of meals) into a set of dinners with one shopping list and a price estimate. It also has a recipe library, a food diary with nutrition tracking, and a pantry mode that suggests what to cook from ingredients you already have.

## Current status

A working **Android prototype**. It is not finished.

- Working: onboarding, recipe library, meal planning flow, food diary, mascot characters and themes, Android home screen widget.
- Prices are **estimates**, not real store prices.
- The prototype runs on test data. AI food recognition and the backend are the next phase.
- The one exception is barcode lookup, which works for real through Open Food Facts.

## Tech stack

- React Native, Expo, TypeScript
- Fineli (Finnish national food composition database) for nutrition data. Calories, macros, allergens and prices are computed from ingredients, not written by hand.

## Try it

- Demo video: [LINK TO BE ADDED]
- Android APK: [LINK TO BE ADDED]

To run from source: `cd app && npm install && npm start`.

## Roadmap

1. Real price data
2. Receipt scanning
3. Closed beta with students
4. Google Play release

## Contact

Sampo
