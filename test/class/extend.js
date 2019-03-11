// A Class that extends Function so we can create
// objects that also behave like functions, i.e. callable objects.
class ExFunc extends Function {
    constructor() {
        // Here we create a dynamic function with `super`,
        // which calls the constructor of the parent class, `Function`.
        // The dynamic function simply passes any calls onto
        // an overridable object method which I named `__call__`.
        // But there is a problem, the dynamic function created from
        // the strings sent to `super` doesn't have any reference to `this`;
        // our new object. There are in fact two `this` objects; the outer
        // one being created by our class inside `constructor` and an inner
        // one created by `super` for the dynamic function.
        // So the reference to this in the text: `return this.__call__(...args)`
        // does not refer to `this` inside `constructor`.
        // So attempting:
        // `obj = new ExFunc();`
        // `obj();`
        // Will throw an Error because __call__ doesn't exist to the dynamic function.
        super('...args', 'return this.__call__(...args)');
        
        // `bind` is the simple remedy to this reference problem.
        // Because the outer `this` is also a function we can call `bind` on it
        // and set a new inner `this` reference. So we bind the inner `this`
        // of our dynamic function to point to the outer `this` of our object.
        // Now our dynamic function can access all the members of our new object.
        // So attempting:
        // `obj = new Exfunc();`
        // `obj();`
        // Will work.
        // We return the value returned by `bind`, which is our `this` callable object,
        // wrapped in a transparent "exotic" function object with its `this` context
        // bound to our new instance (outer `this`).
        // The workings of `bind` are further explained elsewhere in this post.
        return this.bind(this);
    }
    
    // An example property to demonstrate member access.
    get venture() {
        return 'Hank';
    }
    
    // Override this method in subclasses of ExFunc to take whatever arguments
    // you want and perform whatever logic you like. It will be called whenever
    // you use the obj as a function.
    __call__(a, b, c) {
        return [this.venture, a, b, c];
    }
}

// A subclass of ExFunc with an overridden __call__ method.
class DaFunc extends ExFunc {
    get venture() {
        return 'Dean';
    }
    
    __call__(ans) {
        return [this.venture, ans];
    }
}

// Create objects from ExFunc and its subclass.
var callable1 = new ExFunc();
var callable2 = new DaFunc();

// Inheritance is correctly maintained.
console.log('\nInheritance maintained:');
console.log(callable2 instanceof Function);  // true
console.log(callable2 instanceof ExFunc);  // true
console.log(callable2 instanceof DaFunc);  // true

// Test ExFunc and its subclass objects by calling them like functions.
console.log('\nCallable objects:');
console.log( callable1(1, 2, 3) );  // [ 'Hank', 1, 2, 3 ]
console.log( callable2(42) );  // [ 'Dean', 42 ]