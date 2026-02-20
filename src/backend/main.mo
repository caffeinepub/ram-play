import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Migration "migration";

(with migration = Migration.run)
actor {
  var currentOperand : Float = 0.0;
  var result : Float = 0.0;

  public shared ({ caller }) func inputNumber(number : Float) : async Float {
    currentOperand := number;
    currentOperand;
  };

  public shared ({ caller }) func calculate(operation : Text) : async Float {
    let operationFunction : (Float, Float) -> Float = switch (operation) {
      case ("add") { func(x, y) { x + y } };
      case ("subtract") { func(x, y) { x - y } };
      case ("multiply") { func(x, y) { x * y } };
      case ("divide") {
        func(x, y) {
          if (y == 0.0) {
            Runtime.trap("Cannot divide by zero. Please provide a non-zero divisor.");
          };
          x / y;
        };
      };
      case (_) {
        Runtime.trap("Invalid operation. Please use 'add', 'subtract', 'multiply', or 'divide'.");
      };
    };
    result := operationFunction(result, currentOperand);
    currentOperand := 0.0;
    result;
  };

  public query ({ caller }) func getResult() : async Float {
    result;
  };

  public shared ({ caller }) func clear() : async () {
    currentOperand := 0.0;
    result := 0.0;
  };
};
