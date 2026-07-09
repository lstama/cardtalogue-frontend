# Data Model

This document describes the core entities and relationships within the Cardtalogue system. It serves as the source of truth for data structures to ensure consistency across the frontend and backend.

## Naming Convention Note
**Important**: We use the term **"Kard"** (with a 'K') for our primary domain entity. This is intentional to avoid naming collisions with existing third-party "Card" components used elsewhere in the stack.

---

## Core Entities

### 1. Kard
The fundamental unit of the application. Represents a single trading card.
- **Key Fields**:
    - `id`: Unique identifier (UUID).
    - `name`: The display name of the Kard.
    - `type`: The category of the Kard (e.g., Character, Item, Spell).
    - `rarity`: The rarity level.
    - `image_url`: Path to the Kard's visual asset.
    - `description`: Flavor text or mechanical description.
    - `attributes`: Key-value pairs for specific game stats.
    - `quantity`: Number of instances owned.

### 2. Pack
A collection of Kards that are opened or traded together.
- **Key Fields**:
    - `id`: Unique identifier.
    - `name`: Name of the pack.
    - `kards`: A list of `Kard` objects or IDs contained in the pack.
    - `is_sealed`: Boolean indicating if the pack is still unopened.
    - `image_url`: Asset for the pack.

### 3. Game
Represents a specific game or expansion context.
- **Key Fields**:
    - `id`: Unique identifier.
    - `name`: Name of the game.
    - `kards`: List of `Kard` objects associated with this game.
    - `packs`: List of `Pack` objects associated with this game.

### 4. Storage
A logical or physical location where Kards or Packs are organized.
- **Key Fields**:
    - `id`: Unique identifier.
    - `name`: Name of the storage (e.g., "Binder A", "Storage Box 1").
    - `capacity`: Max capacity (optional).
    - `contents`: List of `Kard` or `Pack` IDs stored here.

---

## Relationships

- **Ownership**: A user owns multiple **Kards**, **Packs**, and **Storages**.
- **Containment**:
    - A **Pack** contains many **Kards**.
    - A **Storage** contains many **Kards** and **Packs**.
    - A **Game** organizes both **Kards** and **Packs**.
- **Reference**: **Kards** can be referenced within **Packs**, **Games**, and **Storages**.

## State Management Logic
- **Cart**: Temporary collection of **Kards** or **Packs** intended for a specific action (e.g., "Add to Collection" or "Move to Storage").
- **Inventory**: The persistent state of all owned **Kards**, **Packs**, and **Storages**.
