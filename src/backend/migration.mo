module {
  type OldActor = { var currentOperand : Float; var result : Float };
  type NewActor = {
    var currentOperand : Float;
    var result : Float;
  };

  public func run(old : OldActor) : NewActor {
    { var currentOperand = old.currentOperand; var result = old.result };
  };
};
