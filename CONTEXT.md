# Hlicky

A voice assistant that lives on property listing sites and answers a home buyer's questions about the property they're viewing, backed by Microburbs data and free NSW government data.

## Language

### Pages and properties

**Listing**:
An advertisement for a property on a listing site (realestate.com.au, domain.com.au).
_Avoid_: ad, post

**Property**:
The physical dwelling a Listing advertises, identified by its GNAF ID. Several Listings over time can point at one Property.
_Avoid_: house, home, address

**GNAF ID**:
The national address identifier for a Property; the key Microburbs uses for property-level data.

**Listing Page**:
A page showing exactly one Listing.

**Search Results Page**:
A page showing several Listings at once.

**Listing Context**:
What Hlicky reads from the tab the user is viewing when they ask: either one Listing's address or a set of candidate Listings.

**Clarification**:
Hlicky asking the user which Listing they mean, when the Listing Context has several candidates.

### Places and scale

**Suburb**:
An ABS suburb, named exactly as the ABS names it (e.g. "Kingsford", "Richmond (Vic.)").
_Avoid_: area, locality, neighbourhood

**Mesh Block**:
The smallest ABS area, roughly 30–60 dwellings; presented to users as "your block".
_Avoid_: neighbourhood, street block

**Scale**:
The geographic level a fact describes: property, street, mesh block, suburb, or national.

### Asking and answering

**Question**:
One thing the user asks Hlicky, spoken or typed.

**Answer**:
Hlicky's reply to a Question: a Verdict followed by Evidence.

**Verdict**:
The one-line bottom line that opens an Answer (e.g. "Safer than most of Sydney, but property crime on your block is high").

**Evidence**:
One sourced fact at one Scale that supports a Verdict.

**Topic**:
A subject area Hlicky can look up: crime, hazards, value, rent, schools, transport, lifestyle, demographics, development.

**Conversation**:
The Questions and Answers about one Listing; it ends when the user navigates to a different page.

### Using Hlicky

**Push-to-talk**:
Holding the trigger key to speak a Question; releasing it sends the Question.

**Dashboard**:
The page where the user sees past Conversations, usage stats, and configures Hlicky.
_Avoid_: settings page, admin
