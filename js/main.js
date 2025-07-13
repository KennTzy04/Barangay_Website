document.getElementById("violationForm").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const type = this.type.value;
    const datetime = this.datetime.value;
    const location = this.location.value;
    const description = this.description.value;
    
    const report = document.createElement("div");
    report.innerHTML = `
      <h4>📌 ${type}</h4>
      <p><strong>Date & Time:</strong> ${datetime}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Description:</strong> ${description}</p>
      <hr/>
    `;
    
    document.getElementById("reportList").appendChild(report);
    this.reset();
  });
  