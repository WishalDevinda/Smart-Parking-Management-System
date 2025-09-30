export default function Rates() {
  const rates = [
    { rateID: "rate01", vehicleType: "Bike",  rate:  50.00 },
    { rateID: "rate02", vehicleType: "Car",   rate: 100.00 },
    { rateID: "rate03", vehicleType: "Van",   rate: 150.00 },
    { rateID: "rate04", vehicleType: "Truck", rate: 200.00 },
  ];

  return (
    <>
      <h1 className="pageTitle">Rate Table</h1>

      <section className="card">
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>rateID</th>
                <th>VehicleType</th>
                <th>rate (per hour)</th>
              </tr>
            </thead>
            <tbody>
              {rates.map(r => (
                <tr key={r.rateID}>
                  <td>{r.rateID}</td>
                  <td>{r.vehicleType}</td>
                  <td>{r.rate.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
