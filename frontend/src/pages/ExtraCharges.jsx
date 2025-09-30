export default function ExtraCharges() {
  const extras = [
    { extraID: "extra01", vehicleType: "Bike",  extraCharge: 100.00 },
    { extraID: "extra02", vehicleType: "Car",   extraCharge: 200.00 },
    { extraID: "extra03", vehicleType: "Van",   extraCharge: 300.00 },
    { extraID: "extra04", vehicleType: "Truck", extraCharge: 400.00 },
  ];

  return (
    <>
      <h1 className="pageTitle">Extra Charge Table</h1>

      <section className="card">
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>extraID</th>
                <th>VehicleType</th>
                <th>extraCharge</th>
              </tr>
            </thead>
            <tbody>
              {extras.map(x => (
                <tr key={x.extraID}>
                  <td>{x.extraID}</td>
                  <td>{x.vehicleType}</td>
                  <td>{x.extraCharge.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
