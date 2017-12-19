(function($){
    function autocomplete(e){
        this.nel = $(e);
        this.attrs = $.extend(this.nel.data(), autocomplete.attrs);
        this.build();
    }
    autocomplete.attrs = {
        type:'text',
        placeholder:'Начните вводить код или название',
        'data-town':0
    };
    autocomplete.prototype = {
        limitResults:5,
        loadTimer:0,
        prevValue:'',
        build:function(){
            var self = this;
            this.replaceTpl();
            this.el.on('keyup',function(e){
                var currentValue = $(this).val().toLowerCase().trim();
                if(e.keyCode == 13){

                }
                else if(currentValue && self.prevValue != currentValue){
                    self.error();
                    self.loading(true);
                    self.prevValue = currentValue;
                    clearTimeout(self.loadTimer);
                    self.find()
                }
                else{
                    self.prevValue = currentValue;
                    self.hideVariants();
                    self.error();
                }
            });
            this.el.on('focus',function(e){
                e.target.setSelectionRange(0, $(this).val().length);
                self.showVariants();
                self.error();
            });
            this.el.on('blur',function(e){
                if(self.prevValue && $(this).data('town')==0){
                    self.hideVariants();
                    self.error('Выберите значение из списка');
                }
                else if(!self.prevValue){
                    self.error();
                }
            });
        },
        showVariants:function() {
            this.variants.show();
        },
        hideVariants:function() {
            this.variants.hide();
        },
        loading:function(a){
            var a = a || false;
            if(!a) $('.loading').remove();
            else if(!$('.loading').length) this.variants.prepend('<div class="loading">Загрузка</div>').show();

        },
        find:function(){
            var self = this;
            this.loadTimer = setTimeout(function(){
                self.load();
            },500);
        },
        load:function(){
            var self = this;
            return $.getJSON("ajax/kladr.json",function(data){
                data.sort(function(x,y){
                    x = x.City.toLowerCase(), y = y.City.toLowerCase();
                    return (x < y ?  -1 : (x > y ? 1 : 0));
                });
                data = data.filter(function(i){return i.City.toLowerCase().indexOf(self.prevValue)==0;});
                self.results(data);
            });
        },
        results:function(r){
            var self = this;
            self.loading();
            if(r.length){
                self.variants.html('');
                r.some(function(i,u){
                    if(u == self.limitResults){
                        self.variants.append('<div class="helper">Показано '+u+' из '+ r.length +' найденных городов. Уточните запрос, чтобы увидеть остальные</div>');
                        return true;
                    }
                    else{
                        var className = !u ? 'selected':'';
                        self.variants.append($('<div>',{class:className,html:i.City}));
                    }
                })
            }
            else{
                self.variants.html('<div class="no-matches">Не найдено</div>');
            }
            self.showVariants();
        },
        error:function(a){
            var a = a || false;
            if(!a){
                this.el.removeClass('mistake');
                this.errorBlock.html('').hide();
            }
            else{
                this.el.addClass('mistake');
                this.errorBlock.html(a).show()
            }
        },
        replaceTpl:function(){
            this.variants = $('<div>',{class:'variants'});
            this.block = $('<div>',{class:'autocomplete',html:this.variants});
            this.el = $('<input>',this.attrs);
            this.errorBlock = $('<div>',{class:'error-message'});
            this.block.append(this.el);
            this.block.append(this.errorBlock);
            this.nel.replaceWith(this.block);
        }
    };
    $.fn.autocomplete = function(){return new autocomplete(this);};
    $('[data-type="autocomplete"]').autocomplete();
})($)
