const PageHeader = ({ eyebrow, title, description }) => (
  <header className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 pt-8 sm:px-6 lg:px-8">
    {eyebrow && <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>}
    <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
    {description && <p className="max-w-2xl text-base leading-7 opacity-70">{description}</p>}
  </header>
);

export default PageHeader;
