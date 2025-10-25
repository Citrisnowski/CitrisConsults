import Container from '../../components/Container';

/**
 * Services page displays a simple list of offerings. Each service is
 * presented in a rounded card for quick scanning. You can adjust or
 * extend the services by editing the array below.
 */
const services = [
  {
    title: 'Website Development',
    description: 'Custom websites built to your specifications using modern frameworks.',
  },
  {
    title: 'Maintenance & Support',
    description: 'Ongoing maintenance and support to keep your site running smoothly.',
  },
  {
    title: 'Analytics & Optimization',
    description: 'Track performance and optimize with actionable analytics.',
  },
];

export default function ServicesPage() {
  return (
    <Container className="py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">Our Services</h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(({ title, description }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}