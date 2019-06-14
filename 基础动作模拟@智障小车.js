//变量初始化，避免误操作
$DC = false;    //车辆控制命令无效
$AC = false;    //舵机控制命令无效
$OutMod = 0;    //不改变下次工作模式
simMode = 1;	//控制是否是模拟模式，simMode=1时表示是在用USB摄像头模拟小车运动。
//showMsg("当前模式="+(-difference(31,0)));

//内置全局变量安排 --- 用setValueBase改变,difference读取
//		31		练习步骤变量
//		30		串口数据上次序号记忆
//		29		初始化步骤
//内置模式安排 ---
//		99		初始化模式
//		1		语音交互模式
//		2~98	练习功能模式，即最多可以设置96个练习功能展示

if($g_activeTimes==0){ 				//第一次运行时进入，因为$g_activeTimes每次运行加1
	setValueBase(29,0);				//初始化步骤设置为0，准备开始初始化
	setValueBase(30,getConfig(25));	//设置串口数据序号初值记录，设置当前串口数据序号
									//这样当后面发现串口序号（也就是25号配置）值发生改变时，
									//就能断定有新的串口数据到达
	$OutMod = 99;
	setTimeBase(0);
}
else{
	switch($Mod){
		case 99:Init();			//初始化语音模块
			break;
		case 1:	VoiceControl();	//用语音控制演示步骤
			break;
		default:xcShow();		//执行功能演示
			break;
	}
}

function GetSerialData()
{
	var sDataIndex = getConfig(25);		//获取当前串口数据序号，即系统已收到的串口数据数。
	var sData = -1;						//无数据时返回-1
	if(-difference(30,0)!=sDataIndex){	//通过判断25号配置数据是否变化来判断串口数据是否有更新
		sData = getConfig(26);
		setValueBase(30,sDataIndex);	//更新当前串口数据序号至内置变量#30
	}
	return sData;
}

function VoiceControl()
{
	//获取串口输入，执行响应
	var sData = GetSerialData();
	//识别成功时，串口返回值为指定返回值（若未指定则返回序号）和128相或的结果
	$OutMod = 2;		//演示从Mode 2开始
	switch(sData){	
		case 128:	//前进命令（命令序号0|128）
			setValueBase(31,1);	//演示步骤--前进
			break;
		case 129:	//后退命令（命令序号1|128）
			setValueBase(31,2);//演示步骤--后退
			break;
		case 130:	//左转命令（命令序号2|128）
			setValueBase(31,8);
			//$OutMod=1;//演示步骤--左转	这里把OutMode设置为0是为了防止无法回到语音层（Mod=1）
			break;
		case 131:	//右转命令（命令序号3|128）
			setValueBase(31,4);//演示步骤--右转
			break;
		case 132:	//摇头命令（命令序号5|128）
			setValueBase(31,5);
			//$OutMod=1;//演示步骤--摇头		这里把OutMode设置为0是为了防止无法回到语音层（Mod=1）
			break;
		case 133:	//点头命令（命令序号6|128）
			setValueBase(31,6);//演示步骤--点头
			break;
		default:
			$OutMod = 0;		//未正确识别，不修改工作模式
			break;
	}
}

function xcShow()
{
	switch(-difference(31,0)){//演示步骤
	case 1://演示小车前进
		VehicleForward();
		break;		
	case 2://演示小车后退
		VehicleBackward();
		break;
	case 8://演示小车左转
		VehicleTurnLeft();
		break;
	case 4://演示小车右转
		VehicleTurnRight();
		break;
	case 5://演示摇头
		ShakeHead();
		break;
	case 6://演示小车点头
		NodHead();
		break;
	case 7://有需要这里补充，不需要可删除
		showMsg("补充演示步骤3");
		setValueBase(31,0);//演示步骤变量复位
		setTimeBase(0);
		$OutMod = 1;	//返回语音层面
		break;
	//...
	}
}

function VehicleForward(){
	VehicleMotion(0,"小车前进");
}

function VehicleBackward(){
	VehicleMotion(1,"小车后退");
}

function VehicleTurnLeft(){
	VehicleMotion(2,"小车左转");
}

function VehicleTurnRight(){
	VehicleMotion(3,"小车右转");
}

function VehicleMotion(op,say){//自行完善
	switch($Mod){
		case 0: break;
		case 1:	break;
		case 2:	
			if(getConfig(24)==2){		//上次语音播报完成
				$DC = true;$Dir = op;	//小车前进
				setTimeBase(0);			//记下当前时刻
				ttsSpeak(say);
				$OutMod = 3;
			}
			break;
		case 3:	
			if( elapsed(0)>1000 && getConfig(24)==2 ){
				$DC = true;$Dir = 4;//小车停止
				setTimeBase(0);//记下当前时刻
				ttsSpeak("小车停止");
				$OutMod = 4;
			}
			break;
		//...
		default:
			if(getConfig(24)==2){//上次语音播报完成
				ttsSpeak("完成");
				setValueBase(31,0);//演示步骤变量复位
				setTimeBase(0);
				$OutMod = 1;	//返回语音层面
			}
			break;
	}
}

function ShakeHead()//摇头
{
	switch($Mod){
		case 0: break;
		case 1:	break;
		case 2:	//这里自行补充
			if(getConfig(24)==2){//上次语音播报完成
				ttsSpeak("摇头开始");
				$OutMod = 3;
			}
			break;
		case 3:	//左转头
			if(getConfig(24)==2){		//上次语音播报完成
				ttsSpeak("左");
				$AC=true;$ID=7;$Ang=0;	//水平舵机转到底
				setTimeBase(0);			//记下当前时刻
				$OutMod = 4;
				
			}
			break;
		case 4:	//开始
			if( elapsed(0)<=900 ){//900毫秒转头180度
				$AC=true;$ID=7;$Ang=elapsed(0)/5;	//水平舵机按时转动
			}
			else{
				$OutMod = 5;
			}
			break;
		case 5:	//再次开始
			if(getConfig(24)==2){		//上次语音播报完成
				ttsSpeak("右");
				$AC=true;$ID=7;$Ang=180;//水平舵机转到底
				setTimeBase(0);			//记下当前时刻
				$OutMod = 6;
				
			}
			break;
		case 6: //回
			if( elapsed(0)<=900 ){//900毫秒转头180度
				$AC=true;$ID=7;$Ang=180-elapsed(0)/5;	//水平舵机按时转动
			}
			else{
				$OutMod = 7;
			}
			break;
			
		//////////////////////////////////////////////////////	
		case 7:	//开始
			if(getConfig(24)==2){		//上次语音播报完成
				ttsSpeak("左");
				$AC=true;$ID=7;$Ang=0;	//水平舵机转到底
				setTimeBase(0);			//记下当前时刻
				$OutMod =8;
				
			}
			break;
		case 8:	//
			if( elapsed(0)<=900 ){//900毫秒转头180度
				$AC=true;$ID=7;$Ang=elapsed(0)/5;	//水平舵机按时转动
			}
			else{
				$OutMod = 9;
			}
			break;
		case 9:	//再次开始
			if(getConfig(24)==2){		//上次语音播报完成
				ttsSpeak("右");
				$AC=true;$ID=7;$Ang=180;//水平舵机转到底
				setTimeBase(0);			//记下当前时刻
				$OutMod = 10;
				
			}
			break;
		case 10: //回
			if( elapsed(0)<=900 ){//900毫秒转头180度
				$AC=true;$ID=7;$Ang=180-elapsed(0)/5;	//水平舵机按时转动
			}
			else{
				$OutMod = 11;
			}
			break;
		default:
			if(getConfig(24)==2){//上次语音播报完成
				ttsSpeak("完成");
				setValueBase(31,0);//演示步骤变量复位
				setTimeBase(0);
				$OutMod = 1;	//返回语音层面
			}
			break;
	}
}

function NodHead()//点头
{
	switch($Mod){
		case 0: break;
		case 1:	break;
		case 2:	//这里自行补充
			if(getConfig(24)==2){//上次语音播报完成
				ttsSpeak("点头开始");
				$OutMod = 3;
			}
			break;
		case 3:	//左转头
			if(getConfig(24)==2){		//上次语音播报完成
				ttsSpeak("上");
				$AC=true;$ID=8;$Ang=0;	//水平舵机转到底
				setTimeBase(0);			//记下当前时刻
				$OutMod = 4;
				
			}
			break;
		case 4:	//开始
			if( elapsed(0)<=900 ){//900毫秒转头180度
				$AC=true;$ID=8;$Ang=elapsed(0)/5;	//水平舵机按时转动
			}
			else{
				$OutMod = 5;
			}
			break;
		case 5:	//再次开始
			if(getConfig(24)==2){		//上次语音播报完成
				ttsSpeak("下");
				$AC=true;$ID=8;$Ang=180;//水平舵机转到底
				setTimeBase(0);			//记下当前时刻
				$OutMod = 6;
				
			}
			break;
		case 6: //回
			if( elapsed(0)<=900 ){//900毫秒转头180度
				$AC=true;$ID=8;$Ang=180-elapsed(0)/5;	//水平舵机按时转动
			}
			else{
				$OutMod = 7;
			}
			break;
			
		//////////////////////////////////////////////////////	
		case 7:	//开始
			if(getConfig(24)==2){		//上次语音播报完成
				ttsSpeak("上");
				$AC=true;$ID=8;$Ang=0;	//水平舵机转到底
				setTimeBase(0);			//记下当前时刻
				$OutMod =8;
				
			}
			break;
		case 8:	//
			if( elapsed(0)<=900 ){//900毫秒转头180度
				$AC=true;$ID=8;$Ang=elapsed(0)/5;	//水平舵机按时转动
			}
			else{
				$OutMod = 9;
			}
			break;
		case 9:	//再次开始
			if(getConfig(24)==2){		//上次语音播报完成
				ttsSpeak("下");
				$AC=true;$ID=8;$Ang=180;//水平舵机转到底
				setTimeBase(0);			//记下当前时刻
				$OutMod = 10;
				
			}
			break;
		case 10: //回
			if( elapsed(0)<=900 ){//900毫秒转头180度
				$AC=true;$ID=8;$Ang=180-elapsed(0)/5;	//水平舵机按时转动
			}
			else{
				$OutMod = 11;
			}
			break;
		default:
			if(getConfig(24)==2){//上次语音播报完成
				ttsSpeak("完成");
				setValueBase(31,0);//演示步骤变量复位
				setTimeBase(0);
				$OutMod = 1;	//返回语音层面
			}
			break;
	}
		
}

//下面的这个函数在第一次语音配置函数vrConfig被调用后用于替代vrConfig来进行语音配置
//它会等待上一次配置的完成或超时，然后进行这次的配置，并返回上一次配置是否超时
//当sCfg为空时，只会等待上次的配置完成或超时，不会进行新的配置。
function VR_Wait_Cfg(sCfg,next)
{
	var sData = GetSerialData();
	if( elapsed(0)>1000 || sData==198 || sData==136 ){//超时了或串口数据符合要求进入
		if( sCfg!="" )
			vrConfig(sCfg);
		setValueBase(29,next);
		setTimeBase(0);//设置计时起点
		return !(sData==198 || sData==136);//超过1秒未取得198或136返回true
	}
	return false;
}

function Init(){//用delay会影响系统流程
	//语音配置代码
	switch(-difference(29,0)){
		case 0:	vrConfig("{c0}");//清除识别历史
				setValueBase(29,1);
				setTimeBase(0);//设置计时起点
				break;
		case 1:	if( VR_Wait_Cfg("",2) ) setValueBase(29,100);//c0超时
				break;
		case 2:	if( simMode )
					VR_Wait_Cfg("{a0前进|x000}",3);
				else
					VR_Wait_Cfg("{a0qian jin|x000}",3);
				break;
		case 3:	if( simMode )
					VR_Wait_Cfg("{a0后退|x001}",4);
				else
					VR_Wait_Cfg("{a0hou tui|x001}",4);

				break;
		case 4:	if( simMode )
					VR_Wait_Cfg("{a0左转|x002}",5);
				else
					VR_Wait_Cfg("{a0zuo zhuan|x002}",5);
				break;
		case 5:	if( simMode )
					VR_Wait_Cfg("{a0右转|x003}",6);
				else
					VR_Wait_Cfg("{a0you zhuan|x003}",6);
				break;
		case 6:	if( simMode )
					VR_Wait_Cfg("{a0摇头|x004}",7);
				else
					VR_Wait_Cfg("{a0yao tou|x004}",7);
				break;
		case 7:	if( simMode )
					VR_Wait_Cfg("{a0点头|x004}",8);
				else
					VR_Wait_Cfg("{a0dian tou|x004}",8);
				break;
		case 8: if( simMode )
					VR_Wait_Cfg("{CF}",9);//更新配置
				else
					VR_Wait_Cfg("",9);//无意义操作，纯为了等待前面操作完成。
				break;
		//...
		default:if( elapsed(0)>2000 ){
					if( -difference(29,0)!=100 )	ttsSpeak("语音模块准备完成");
					else 							ttsSpeak("语音模块准备失败");
					setValueBase(29,0);//恢复29号变量为0
					setValueBase(31,0);//设置演示步骤变量初值
					$OutMod = 1;//进入语音层
				}
				break;
	}
}
