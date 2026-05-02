import { Logo } from "./components/Logo";
import { JoinForm } from "./components/JoinForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <header className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-3">
            <Logo className="h-9 w-auto" />
            <span className="sr-only">KNX Club Jordan</span>
          </a>
          <nav className="hidden gap-8 text-sm font-medium text-neutral-700 md:flex">
            <a href="#about" className="hover:text-knx">About</a>
            <a href="#events" className="hover:text-knx">Events</a>
            <a href="#join" className="hover:text-knx">Join</a>
            <a href="#contact" className="hover:text-knx">Contact</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-semibold tracking-widest text-knx uppercase">
              Jordanian KNX Community
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Smart buildings.{" "}
              <span className="text-knx">Open standard.</span>{" "}
              One community.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-neutral-600">
              KNX Club Jordan brings together integrators, engineers, architects, and
              enthusiasts working with the world&apos;s leading open standard for home
              and building automation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#join"
                className="rounded-md bg-knx px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-knx-dark"
              >
                Join the club
              </a>
              <a
                href="#about"
                className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-800 transition hover:border-knx hover:text-knx"
              >
                Learn more
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 rounded-full bg-knx-light blur-2xl" />
              <Logo className="relative h-48 w-auto md:h-64" />
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-neutral-100 bg-knx-light/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">About the club</h2>
          <p className="mt-4 max-w-3xl text-neutral-700">
            We are a non-profit community of KNX professionals based in Jordan. Our
            mission is to advance the adoption of the KNX standard across the region
            through training, networking, and shared projects.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Training",
                body:
                  "Hands-on workshops on ETS, lighting, HVAC, shading, and IoT integration.",
              },
              {
                title: "Networking",
                body:
                  "Monthly meetups connecting integrators, consultants, and end users.",
              },
              {
                title: "Standards",
                body:
                  "Stay current with the latest KNX IoT, KNX Secure, and Matter bridges.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 transition hover:border-knx"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-knx text-white">
                  <span className="text-lg font-bold">·</span>
                </div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="events" className="border-t border-neutral-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Upcoming events</h2>
          <p className="mt-4 max-w-3xl text-neutral-700">
            Stay tuned. The 2026 calendar is being finalised — sign up below to be
            notified first.
          </p>
          <ul className="mt-10 divide-y divide-neutral-100 rounded-xl border border-neutral-200">
            <li className="flex items-center justify-between gap-6 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-knx">
                  Workshop
                </p>
                <p className="mt-1 font-semibold">ETS6 Fundamentals</p>
                <p className="text-sm text-neutral-600">Amman · TBD 2026</p>
              </div>
              <span className="rounded-full bg-knx-light px-3 py-1 text-xs font-medium text-knx-dark">
                Coming soon
              </span>
            </li>
            <li className="flex items-center justify-between gap-6 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-knx">
                  Meetup
                </p>
                <p className="mt-1 font-semibold">KNX Secure & IoT in 2026</p>
                <p className="text-sm text-neutral-600">Amman · TBD 2026</p>
              </div>
              <span className="rounded-full bg-knx-light px-3 py-1 text-xs font-medium text-knx-dark">
                Coming soon
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section id="join" className="border-t border-neutral-100 bg-knx-light/40">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Join the club</h2>
          <p className="mt-4 text-neutral-700">
            Leave your details and we&apos;ll keep you posted on training, meetups,
            and projects.
          </p>
          <div className="mt-8">
            <JoinForm />
          </div>
        </div>
      </section>

      <footer
        id="contact"
        className="border-t border-neutral-100 bg-white"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
            <span className="text-sm text-neutral-600">
              © {new Date().getFullYear()} KNX Club Jordan
            </span>
          </div>
          <div className="text-sm text-neutral-600">
            <a href="mailto:hello@knxclub.jo" className="hover:text-knx">
              hello@knxclub.jo
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
