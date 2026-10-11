# Husmusen architecture summary

Draft for future reference, 11 October 2026.

This note records the agreed direction. Offline mode is deferred; it is not being implemented now.

The household server is planned to run on a Raspberry Pi ("the Pi") on the household LAN, hosting the Go backend and CouchDB. It must not be exposed to the internet.

## Household enrollment and device trust

Joining a household requires access to its LAN, the household invite code, and Google sign-in. The server enforces enrollment; network access alone does not grant membership. LAN reachability is an additional barrier, not proof of physical presence.

Invite codes are single-use and expire. The server must atomically consume a valid, unexpired code when establishing membership, preventing concurrent reuse. Code expiry does not expire the resulting membership.

The invite code authorizes initial synchronization and establishes a server-side association between the household and the authenticated Google user. Subsequent server access is authorized through that user's household membership. The invite code is no longer needed and must not be stored on the device.

The default model permits unencrypted local household storage. Protecting data from other people sharing an enrolled browser profile is outside the default scope. Husmusen is not intended for extremely sensitive data. PouchDB encryption is a last resort, not a requirement for offline access.

A device that has synchronized household data is trusted to retain its local copy. In a browser application, this means the browser profile's installation of Husmusen. Device trust permits local storage; Google-user membership authorizes server access. No separate device membership credential is required by this model.

## Authentication and Google Calendar

Google sign-in and Calendar authorization are separate flows. Google is the initial calendar provider; other providers may be supported later.

For backend authentication, the browser sends a Google ID token to the Pi. The Go service validates it and establishes a Husmusen session. All backend data access and synchronization require a valid Google-backed Husmusen session and active household membership for that Google user. This must also apply to CouchDB replication.

An established session does not require contacting Google for every request. If the session needs renewal, synchronization waits for Google reauthentication. Local household work remains available on an enrolled device.

Initial Google Calendar integration is read-only and fetched directly by the browser with separate Calendar authorization. Google Calendar and all other Google-sourced data must never be persisted in PouchDB or another offline cache. Results may be held in memory while the app is open. Offline household editing does not extend to Google Calendar events.

Google sign-in alone does not establish new household membership or authorize Calendar access. An existing household member does not need the invite code again. Signing out of Husmusen does not sign the user out of Google.

## Future household data and offline work

Offline access requires at least one successful connection to the household server as an authorized Google user and downloading household data. The device can subsequently read and edit that local copy without reaching either the Pi or Google.

PouchDB would hold only Husmusen household documents. A data adapter would read documents, subscribe to changes, and expose rendering snapshots to React; useSyncExternalStore is one possible interface.

```text
User saves an edit
  -> data layer writes PouchDB
  -> PouchDB emits a change
  -> data layer refreshes the rendering snapshot
  -> React renders the update

PouchDB <-> authenticated replication endpoint <-> CouchDB on Pi
```

Local edits remain pending until authorized synchronization is possible. They are not shared with other devices until accepted by the server. The replication endpoint and its integration with Go-issued sessions remain to be designed; a Husmusen session does not automatically authenticate direct CouchDB replication.

## Independent service connectivity

Connectivity is tracked separately for Google and each household server. Being away from home can leave Google Calendar available while household synchronization is unavailable.

| Google reachable | Selected household Pi reachable | Available behavior |
| --- | --- | --- |
| Yes | Yes | Google Calendar access and household synchronization, with the required authorization |
| Yes | No | Google Calendar access; household work stays local pending synchronization |
| No | Yes | Local household work; synchronization can continue with a valid Husmusen session |
| No | No | Local household work only |

If Google is unavailable and the Husmusen session needs renewal, synchronization waits even when the Pi is reachable. Google being unavailable while the Pi is reachable can occur during a home internet outage; it needs no special application mode.

Track household membership, local-data availability, session validity, and service connectivity independently. An unreachable service does not by itself mean signed out or removed from the household.

## Multiple households and severing membership

A Google user can belong to several households, and a device can retain local copies for several households. Use stable server-assigned household IDs, separate server-side user memberships, and separate local databases and replication destinations. Show the active household clearly. Reaching a friend's Pi must not automatically establish membership, download data, or redirect another household's replication.

Revoking a Google user's household membership ends that user's future server access, including reads, writes, and synchronization of pending edits. It does not guarantee deletion of retained local data or prevent continued local use. The app can offer local removal without promising secure erasure. Removing a household locally from one device is distinct from revoking the user's membership.

A consumed invite code cannot be reused to rejoin after membership is revoked. Rejoining requires another valid, unexpired invite code, LAN access, and Google sign-in.

## Remaining implementation decisions

- Session lifetime and renewal; whether individual device sessions need separate revocation while the Google user remains a household member.
- Handling pending edits on sign-out, account switching, household removal, or revocation.
- Conflict resolution for concurrent changes.
- Browser storage loss/eviction and recovery.
- Cross-tab coordination when sessions or households change.

Offline persistence and replication remain a later implementation phase. Local encryption is not part of the default design.
