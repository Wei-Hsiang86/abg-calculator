function calculate() {
  const pH = document.getElementById("pH").value;
  document.getElementById("result").innerText = pH * 2;

  try {
    const { pH, PaO2, PaCO2, HCO3, Na, Cl } = req.body;
    const data = { pH, PaO2, PaCO2, HCO3, Na, Cl };

    if (!pH) throw new Error("Please enter pH.");
    if (!PaO2) throw new Error("Please enter PaO2.");
    if (!PaCO2) throw new Error("Please enter PaCO2.");
    if (!HCO3) throw new Error("Please enter HCO3-.");

    // 計算氧合
    let bloodO2;
    if (PaO2 > 80) {
      bloodO2 = "血氧正常";
    } else if (PaO2 > 60) {
      bloodO2 = "併輕度低血氧";
    } else if (PaO2 > 40) {
      bloodO2 = "併中度低血氧";
    } else {
      bloodO2 = "併重度低血氧";
    }

    if (pH > 7.7 || pH < 6.6) {
      data.type = "text-danger border-danger border-5";
      data.abgResult = "Result: 別算了，快去看看患者生命徵象是否穩定!!!";
      return res.render("admin/abg-calculator", { data });
    }

    if (
      pH > 7.35 &&
      pH < 7.45 &&
      PaCO2 > 35 &&
      PaCO2 < 45 &&
      HCO3 > 22 &&
      HCO3 < 26
    ) {
      PaO2 > 80 ? (data.type = "text-success") : (data.type = "text-danger");
      data.abgResult = `Result: 患者目前血液酸鹼值在正常值內，${bloodO2}`;
      return res.render("admin/abg-calculator", { data });
    } else if (pH <= 7.4) {
      data.type = "text-danger";

      if (PaCO2 < 40 && HCO3 > 24) {
        req.flash(
          "error_messages",
          "請檢察輸入是否有誤，若有誤請重新輸入PaCO3, HCO3"
        );
        return res.redirect("back");
      } else if (PaCO2 > 40) {
        const deltaHydrogen = Math.abs(40 - Math.pow(10, 9 - pH));
        const progression = deltaHydrogen / Math.abs(PaCO2 - 40 + 0.0000001);

        if (progression >= 0.3) {
          const HCO3Comp = 24 + 0.1 * (PaCO2 - 40);

          if (HCO3 > HCO3Comp + 3) {
            data.abgResult = `Result: 患者目前為，急性呼吸酸併代謝鹼，${bloodO2}`;
            return res.render("admin/abg-calculator", { data });
          } else if (HCO3 < HCO3Comp - 3) {
            data.abgResult = `Result: 患者目前為，急性呼吸酸併代謝酸，${bloodO2}`;
            return res.render("admin/abg-calculator", { data });
          } else if (HCO3 <= HCO3Comp + 3 && HCO3 >= HCO3Comp - 3) {
            if (pH < 7.35) {
              data.abgResult = `Result: 患者目前為，急性呼吸酸併代謝不完全代償，${bloodO2}`;
              return res.render("admin/abg-calculator", { data });
            } else {
              data.abgResult = `Result: 患者目前為，急性呼吸酸併代謝完全代償，${bloodO2}`;
              return res.render("admin/abg-calculator", { data });
            }
          } else {
            req.flash("error_messages", "請檢察輸入是否有誤");
            return res.redirect("back");
          }
        } else {
          // progression < 0.3
          const HCO3Comp = 24 + 0.35 * (PaCO2 - 40);

          if (HCO3 > HCO3Comp + 3) {
            data.abgResult = `Result: 患者目前為，慢性呼吸酸併代謝鹼，${bloodO2}`;
            return res.render("admin/abg-calculator", { data });
          } else if (HCO3 < HCO3Comp - 3) {
            data.abgResult = `Result: 患者目前為，慢性呼吸酸併代謝酸，${bloodO2}`;
            return res.render("admin/abg-calculator", { data });
          } else if (HCO3 <= HCO3Comp + 3 && HCO3 >= HCO3Comp - 3) {
            if (pH < 7.35) {
              data.abgResult = `Result: 患者目前為，慢性呼吸酸併代謝不完全代償，${bloodO2}`;
              return res.render("admin/abg-calculator", { data });
            } else {
              data.abgResult = `Result: 患者目前為，慢性呼吸酸併代謝完全代償，${bloodO2}`;
              return res.render("admin/abg-calculator", { data });
            }
          } else {
            req.flash("error_messages", "請檢察輸入是否有誤");
            return res.redirect("back");
          }
        }
      } else {
        // PaCO2 <= 40
        if (HCO3 <= 24) {
          const PaCO2Comp = 40 - 1.2 * (24 - HCO3);
          const ag = Na - Cl - HCO3;

          // 計算 AG
          let agResult;
          if (ag > 14) {
            agResult = `陰離子間隙為${ag}，高AG代謝性酸中毒`;
          } else if (ag >= 10 && ag <= 14) {
            agResult = `陰離子間隙為${ag}，高氯性代謝性酸中毒`;
          } else {
            req.flash(
              "error_messages",
              "請檢察輸入是否有誤，若有誤請重新輸入Na+,Cl-"
            );
            return res.redirect("back");
          }

          if (PaCO2 > PaCO2Comp + 5) {
            data.abgResult = `Result: 患者目前${agResult}，代謝酸併呼吸酸，${bloodO2}`;
            return res.render("admin/abg-calculator", { data });
          } else if (PaCO2 < PaCO2Comp - 5) {
            data.abgResult = `Result: 患者目前${agResult}，代謝酸併呼吸鹼，${bloodO2}`;
            return res.render("admin/abg-calculator", { data });
          } else if (PaCO2 <= PaCO2Comp + 5 && PaCO2 >= PaCO2Comp - 5) {
            if (pH < 7.35) {
              data.abgResult = `Result: 患者目前${agResult}，代謝酸併呼吸不完全代償，${bloodO2}`;
              return res.render("admin/abg-calculator", { data });
            } else {
              data.abgResult = `Result: 患者目前${agResult}，代謝酸併呼吸完全代償，${bloodO2}`;
              return res.render("admin/abg-calculator", { data });
            }
          } else {
            req.flash("error_messages", "請檢察輸入是否有誤");
            return res.redirect("back");
          }
        }
      }
    } else {
      // pH > 7.4
      data.type = "text-danger";

      if (PaCO2 <= 40) {
        const deltaHydrogen = Math.abs(40 - Math.pow(10, 9 - pH));
        const progression = deltaHydrogen / Math.abs(PaCO2 - 40 + 0.0000001);

        if (progression >= 0.3) {
          const HCO3Comp = 24 - 0.2 * (40 - PaCO2);

          if (HCO3 > HCO3Comp + 3) {
            data.abgResult = `Result: 患者目前為，急性呼吸鹼併代謝鹼，${bloodO2}`;
            return res.render("admin/abg-calculator", { data });
          } else if (HCO3 < HCO3Comp - 3) {
            data.abgResult = `Result: 患者目前為，急性呼吸鹼併代謝酸，${bloodO2}`;
            return res.render("admin/abg-calculator", { data });
          } else if (HCO3 <= HCO3Comp + 3 && HCO3 >= HCO3Comp - 3) {
            if (pH > 7.45) {
              data.abgResult = `Result: 患者目前為，急性呼吸鹼併代謝不完全代償，${bloodO2}`;
              return res.render("admin/abg-calculator", { data });
            } else {
              data.abgResult = `Result: 患者目前為，急性呼吸鹼併代謝完全代償，${bloodO2}`;
              return res.render("admin/abg-calculator", { data });
            }
          } else {
            req.flash("error_messages", "請檢察輸入是否有誤");
            return res.redirect("back");
          }
        } else if (progression < 0.3) {
          const HCO3Comp = 24 - 0.4 * (40 - PaCO2);

          if (HCO3 > HCO3Comp + 3) {
            data.abgResult = `Result: 患者目前為，慢性呼吸鹼併代謝鹼，${bloodO2}`;
            return res.render("admin/abg-calculator", { data });
          } else if (HCO3 < HCO3Comp - 3) {
            data.abgResult = `Result: 患者目前為，慢性呼吸鹼併代謝酸，${bloodO2}`;
            return res.render("admin/abg-calculator", { data });
          } else if (HCO3 <= HCO3Comp + 3 && HCO3 >= HCO3Comp - 3) {
            if (pH > 7.45) {
              data.abgResult = `Result: 患者目前為，慢性呼吸鹼併代謝不完全代償，${bloodO2}`;
              return res.render("admin/abg-calculator", { data });
            } else {
              data.abgResult = `Result: 患者目前為，慢性呼吸鹼併代謝完全代償，${bloodO2}`;
              return res.render("admin/abg-calculator", { data });
            }
          } else {
            req.flash("error_messages", "請檢察輸入是否有誤");
            return res.redirect("back");
          }
        } else {
          req.flash("error_messages", "請檢察輸入是否有誤");
          return res.redirect("back");
        }
      } else if (PaCO2 > 40) {
        if (HCO3 >= 24) {
          const PaCO2Comp = 40 + 0.7 * (HCO3 - 24);

          if (PaCO2 > PaCO2Comp + 5) {
            data.abgResult = `患者目前為，代謝鹼併呼吸酸，${bloodO2}`;
            return res.render("admin/abg-calculator", { data });
          } else if (PaCO2 < PaCO2Comp - 5) {
            data.abgResult = `患者目前為，代謝鹼併呼吸鹼，${bloodO2}`;
            return res.render("admin/abg-calculator", { data });
          } else if (PaCO2 <= PaCO2Comp + 5 && PaCO2 >= PaCO2Comp - 5) {
            if (pH > 7.45) {
              data.abgResult = `患者目前為，代謝鹼併呼吸不完全代償，${bloodO2}`;
              return res.render("admin/abg-calculator", { data });
            } else {
              data.abgResult = `患者目前為，代謝鹼併呼吸完全代償，${bloodO2}`;
              return res.render("admin/abg-calculator", { data });
            }
          } else {
            req.flash("error_messages", "請檢察輸入是否有誤");
            return res.redirect("back");
          }
        } else {
          req.flash("error_messages", "請檢察輸入是否有誤");
          return res.redirect("back");
        }
      } else {
        req.flash("error_messages", "請檢察輸入是否有誤");
        return res.redirect("back");
      }
    }
  } catch (err) {
    console.log(err);
  }
}
